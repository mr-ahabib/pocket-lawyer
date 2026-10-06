import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as Gemma from '@modules/gemma-llm';
import { DEFAULT_MODEL, deleteModel as rmModel, downloadModel, isDownloaded, modelFile, type ModelSpec } from './models';
import { loadSettings, saveSettings, type Settings } from './settings';
import { File, Paths } from 'expo-file-system';

/**
 * Crash guard: a native model load can take the whole process down on unsupported hardware.
 * We write a marker before loading and clear it after; if the marker survives to the next
 * launch, the previous load crashed and we stop auto-loading until the user retries.
 */
const loadMarker = () => new File(Paths.document, 'model-loading.lock');
function markerExists() {
  try { return loadMarker().exists; } catch { return false; }
}
function setMarker(on: boolean) {
  try {
    const f = loadMarker();
    if (on && !f.exists) f.create();
    if (!on && f.exists) f.delete();
  } catch {}
}

export type ModelStatus = 'unavailable' | 'not_downloaded' | 'downloading' | 'downloaded' | 'loading' | 'ready' | 'error';

type Ctx = {
  settings: Settings;
  updateSettings: (p: Partial<Settings>) => void;
  spec: ModelSpec;
  status: ModelStatus;
  progress: { written: number; total: number } | null;
  error: string | null;
  nativeAvailable: boolean;
  device: ReturnType<typeof Gemma.deviceInfo>;
  download: () => Promise<void>;
  cancelDownload: () => void;
  load: () => Promise<boolean>;
  unload: () => Promise<void>;
  remove: () => Promise<void>;
  refresh: () => void;
};

/**
 * The 1B on-device model writes unreliable Bangla, so its free-text explanation is off.
 * Answers come from the statute-grounded composer only. Flip to true to re-enable.
 */
export const AI_EXPLAIN_ENABLED = false;

const ModelCtx = createContext<Ctx | null>(null);

/** MediaPipe LLM only runs on 64-bit ARM phones; x86 (emulators) crash the process. */
export function deviceSupported() {
  const abis = Gemma.deviceInfo().supportedAbis;
  // the APK ships only arm64 native libs; any device that can run them (incl. emulators with ARM translation) qualifies
  return abis.length === 0 || abis.includes('arm64-v8a');
}

function computeStatus(spec: ModelSpec): ModelStatus {
  if (!Gemma.isNativeAvailable() || !deviceSupported()) return 'unavailable';
  if (markerExists() && isDownloaded(spec)) return 'error';
  if (Gemma.isLoaded() && Gemma.loadedModelPath() === modelFile(spec).uri.replace('file://', '')) return 'ready';
  return isDownloaded(spec) ? 'downloaded' : 'not_downloaded';
}

export function ModelProvider({ children }: { children: React.ReactNode }) {
  const spec = DEFAULT_MODEL;
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [status, setStatus] = useState<ModelStatus>(() => computeStatus(spec));
  const [progress, setProgress] = useState<Ctx['progress']>(null);
  const [error, setError] = useState<string | null>(() =>
    markerExists() && isDownloaded(spec) ? 'গতবার অফলাইন এআই চালু করার সময় অ্যাপ বন্ধ হয়ে গিয়েছিল। এই ফোনে এটি সমর্থিত না-ও হতে পারে; চাইলে আবার চেষ্টা করুন।' : null,
  );
  const abortRef = useRef<AbortController | null>(null);
  const loadingRef = useRef<Promise<boolean> | null>(null);
  const nativeAvailable = Gemma.isNativeAvailable() && deviceSupported();
  const device = useMemo(() => Gemma.deviceInfo(), []);

  const refresh = useCallback(() => setStatus(computeStatus(spec)), [spec]);

  const updateSettings = useCallback((p: Partial<Settings>) => {
    setSettings((s) => {
      const n = { ...s, ...p };
      saveSettings(n);
      return n;
    });
  }, []);

  const download = useCallback(async () => {
    if (!nativeAvailable) return;
    setError(null);
    setStatus('downloading');
    setProgress({ written: 0, total: spec.sizeBytes });
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      await downloadModel(spec, (written, total) => setProgress({ written, total }), ac.signal);
      setStatus('downloaded');
    } catch (e: any) {
      if (ac.signal.aborted) setStatus('not_downloaded');
      else {
        setError(e?.message ?? String(e));
        setStatus('error');
      }
    } finally {
      abortRef.current = null;
      setProgress(null);
    }
  }, [spec, nativeAvailable]);

  const cancelDownload = useCallback(() => abortRef.current?.abort(), []);

  const load = useCallback(async () => {
    if (!nativeAvailable || !isDownloaded(spec)) return false;
    if (Gemma.isLoaded() && Gemma.loadedModelPath() === modelFile(spec).uri.replace('file://', '')) {
      setStatus('ready');
      return true;
    }
    if (loadingRef.current) return loadingRef.current;
    const run = (async () => {
      setStatus('loading');
      setError(null);
      // GPU only on real ARM hardware (emulators report arm64 via translation but have no OpenCL)
      const isArm64 = device.supportedAbis[0] === 'arm64-v8a';
      const order: ('gpu' | 'cpu')[] =
        settings.backend === 'gpu' ? ['gpu', 'cpu'] : settings.backend === 'cpu' ? ['cpu'] : isArm64 ? ['gpu', 'cpu'] : ['cpu'];
      let lastErr: any = null;
      setMarker(true);
      for (const backend of order) {
        try {
          await Gemma.loadModel(modelFile(spec).uri, { backend, maxTokens: spec.maxTokens });
          setMarker(false);
          setStatus('ready');
          return true;
        } catch (e) {
          lastErr = e;
        }
      }
      setMarker(false);
      setError(lastErr?.message ?? String(lastErr));
      setStatus('error');
      return false;
    })();
    loadingRef.current = run;
    try {
      return await run;
    } finally {
      loadingRef.current = null;
    }
  }, [spec, settings.backend, nativeAvailable, device.supportedAbis]);

  const unload = useCallback(async () => {
    await Gemma.unload();
    refresh();
  }, [refresh]);

  const remove = useCallback(async () => {
    await Gemma.unload();
    rmModel(spec);
    refresh();
  }, [spec, refresh]);

  // Zero-setup: download once on first launch, then keep the model loaded.
  const autoRan = useRef(false);
  useEffect(() => {
    if (!AI_EXPLAIN_ENABLED || autoRan.current || !nativeAvailable) return;
    autoRan.current = true;
    // deferred so the first frame renders before the download / load kicks in
    const tmr = setTimeout(() => {
      if (status === 'not_downloaded') void download();
      else if (status === 'downloaded' && settings.autoLoad) void load();
    }, 400);
    return () => clearTimeout(tmr);
  }, [status, nativeAvailable, download, load, settings.autoLoad]);
  useEffect(() => {
    if (!AI_EXPLAIN_ENABLED || status !== 'downloaded' || !settings.autoLoad || !autoRan.current) return;
    const tmr = setTimeout(() => void load(), 50);
    return () => clearTimeout(tmr);
  }, [status, settings.autoLoad, load]);

  const value: Ctx = { settings, updateSettings, spec, status, progress, error, nativeAvailable, device, download, cancelDownload, load, unload, remove, refresh };
  return <ModelCtx.Provider value={value}>{children}</ModelCtx.Provider>;
}

export function useModel() {
  const c = useContext(ModelCtx);
  if (!c) throw new Error('useModel outside ModelProvider');
  return c;
}
