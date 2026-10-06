package expo.modules.gemmallm

import android.app.ActivityManager
import android.content.Context
import android.os.Build
import com.google.mediapipe.tasks.genai.llminference.LlmInference
import com.google.mediapipe.tasks.genai.llminference.LlmInferenceSession
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicBoolean

class LoadOptions : Record {
  @Field val maxTokens: Int = 1536
  @Field val backend: String = "cpu" // cpu | gpu | default
  @Field val maxTopK: Int = 64
}

class GenerateOptions : Record {
  @Field val temperature: Float = 0.3f
  @Field val topK: Int = 40
  @Field val topP: Float = 0.95f
  @Field val randomSeed: Int = 0
}

/**
 * Thin Expo wrapper over Google's MediaPipe LLM Inference API.
 * One LlmInference engine is kept alive; every generate() call uses a fresh session
 * so conversation state is fully controlled by the JS side (RAG prompt).
 */
class GemmaLlmModule : Module() {
  private var engine: LlmInference? = null
  private var loadedPath: String? = null
  private var activeSession: LlmInferenceSession? = null
  private val scope = CoroutineScope(Dispatchers.IO)
  private val callbackExecutor = Executors.newSingleThreadExecutor()

  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  override fun definition() = ModuleDefinition {
    Name("GemmaLlm")

    Events("onToken", "onLoadProgress")

    Constants {
      val am = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
      val mi = ActivityManager.MemoryInfo()
      am.getMemoryInfo(mi)
      mapOf(
        "totalMemoryBytes" to mi.totalMem,
        "supportedAbis" to Build.SUPPORTED_ABIS.toList(),
        "device" to "${Build.MANUFACTURER} ${Build.MODEL}",
        "sdkInt" to Build.VERSION.SDK_INT
      )
    }

    Function("isLoaded") { engine != null }

    Function("loadedModelPath") { loadedPath }

    Function("availableMemoryBytes") {
      val am = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
      val mi = ActivityManager.MemoryInfo()
      am.getMemoryInfo(mi)
      mi.availMem
    }

    AsyncFunction("loadModel") Coroutine { path: String, options: LoadOptions ->
      withContext(Dispatchers.IO) {
        val file = File(path.removePrefix("file://"))
        if (!file.exists()) throw ModelNotFoundException(file.absolutePath)
        unloadInternal()
        val backend = when (options.backend.lowercase()) {
          "gpu" -> LlmInference.Backend.GPU
          "default" -> LlmInference.Backend.DEFAULT
          else -> LlmInference.Backend.CPU
        }
        val opts = LlmInference.LlmInferenceOptions.builder()
          .setModelPath(file.absolutePath)
          .setMaxTokens(options.maxTokens)
          .setMaxTopK(options.maxTopK)
          .setPreferredBackend(backend)
          .build()
        engine = LlmInference.createFromOptions(context, opts)
        loadedPath = file.absolutePath
        mapOf("path" to file.absolutePath, "backend" to options.backend)
      }
    }

    AsyncFunction("unload") Coroutine { ->
      withContext(Dispatchers.IO) { unloadInternal() }
      null
    }

    Function("sizeInTokens") { text: String ->
      engine?.sizeInTokens(text) ?: -1
    }

    AsyncFunction("generate") { requestId: String, prompt: String, options: GenerateOptions, promise: Promise ->
      val llm = engine ?: run {
        promise.reject("E_NOT_LOADED", "Model is not loaded", null)
        return@AsyncFunction
      }
      scope.launch {
        var session: LlmInferenceSession? = null
        val settled = AtomicBoolean(false)
        val full = StringBuilder()
        try {
          val sb = LlmInferenceSession.LlmInferenceSessionOptions.builder()
            .setTemperature(options.temperature)
            .setTopK(options.topK)
            .setTopP(options.topP)
          if (options.randomSeed != 0) sb.setRandomSeed(options.randomSeed)
          session = LlmInferenceSession.createFromOptions(llm, sb.build())
          activeSession = session
          session.addQueryChunk(prompt)
          val future = session.generateResponseAsync { partial, done ->
            if (partial != null && partial.isNotEmpty()) full.append(partial)
            sendEvent("onToken", mapOf("requestId" to requestId, "text" to (partial ?: ""), "done" to done))
            if (done && settled.compareAndSet(false, true)) {
              promise.resolve(mapOf("requestId" to requestId, "text" to full.toString()))
              closeSession(session)
            }
          }
          future.addListener({
            try {
              future.get()
              if (settled.compareAndSet(false, true)) {
                promise.resolve(mapOf("requestId" to requestId, "text" to full.toString()))
                closeSession(session)
              }
            } catch (e: Exception) {
              if (settled.compareAndSet(false, true)) {
                val cancelled = e.message?.contains("cancel", true) == true
                if (cancelled) {
                  promise.resolve(mapOf("requestId" to requestId, "text" to full.toString(), "cancelled" to true))
                } else {
                  promise.reject("E_GENERATE", e.cause?.message ?: e.message, e)
                }
                closeSession(session)
              }
            }
          }, callbackExecutor)
        } catch (e: Exception) {
          if (settled.compareAndSet(false, true)) {
            promise.reject("E_GENERATE", e.message, e)
          }
          closeSession(session)
        }
      }
    }

    Function("cancel") {
      try { activeSession?.cancelGenerateResponseAsync() } catch (_: Exception) {}
    }

    OnDestroy {
      unloadInternal()
      callbackExecutor.shutdown()
    }
  }

  private fun closeSession(session: LlmInferenceSession?) {
    try {
      if (activeSession === session) activeSession = null
      session?.close()
    } catch (_: Exception) {}
  }

  private fun unloadInternal() {
    try { activeSession?.cancelGenerateResponseAsync() } catch (_: Exception) {}
    closeSession(activeSession)
    try { engine?.close() } catch (_: Exception) {}
    engine = null
    loadedPath = null
  }
}

class ModelNotFoundException(path: String) :
  expo.modules.kotlin.exception.CodedException("E_MODEL_NOT_FOUND", "Model file not found at $path", null)
