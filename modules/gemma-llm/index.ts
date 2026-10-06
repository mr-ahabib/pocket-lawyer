import { requireOptionalNativeModule } from 'expo';
import type { EventSubscription } from 'expo-modules-core';

export type LoadOptions = { maxTokens?: number; backend?: 'cpu' | 'gpu' | 'default'; maxTopK?: number };
export type GenerateOptions = { temperature?: number; topK?: number; topP?: number; randomSeed?: number };
export type TokenEvent = { requestId: string; text: string; done: boolean };

type NativeModule = {
  totalMemoryBytes: number;
  supportedAbis: string[];
  device: string;
  sdkInt: number;
  isLoaded(): boolean;
  loadedModelPath(): string | null;
  availableMemoryBytes(): number;
  loadModel(path: string, options: LoadOptions): Promise<{ path: string; backend: string }>;
  unload(): Promise<void>;
  sizeInTokens(text: string): number;
  generate(requestId: string, prompt: string, options: GenerateOptions): Promise<{ requestId: string; text: string; cancelled?: boolean }>;
  cancel(): void;
  addListener(event: 'onToken', listener: (e: TokenEvent) => void): EventSubscription;
};

const native = requireOptionalNativeModule<NativeModule>('GemmaLlm');

export const isNativeAvailable = () => native != null;

export const deviceInfo = () => ({
  totalMemoryBytes: native?.totalMemoryBytes ?? 0,
  supportedAbis: native?.supportedAbis ?? [],
  device: native?.device ?? 'unknown',
  sdkInt: native?.sdkInt ?? 0,
});

export const isLoaded = () => native?.isLoaded() ?? false;
export const loadedModelPath = () => native?.loadedModelPath() ?? null;
export const availableMemoryBytes = () => native?.availableMemoryBytes() ?? 0;

export async function loadModel(path: string, options: LoadOptions = {}) {
  if (!native) throw new Error('GemmaLlm native module unavailable (needs a development build)');
  return native.loadModel(path, { maxTokens: 1536, backend: 'cpu', maxTopK: 64, ...options });
}

export async function unload() {
  await native?.unload();
}

export function cancel() {
  native?.cancel();
}

export function sizeInTokens(text: string) {
  return native?.sizeInTokens(text) ?? -1;
}

let counter = 0;

/** Streams tokens through onToken; resolves with the complete text. */
export async function generate(
  prompt: string,
  onToken: (partial: string) => void,
  options: GenerateOptions = {},
): Promise<{ text: string; cancelled: boolean }> {
  if (!native) throw new Error('GemmaLlm native module unavailable');
  const requestId = `req_${Date.now()}_${counter++}`;
  const sub = native.addListener('onToken', (e) => {
    if (e.requestId === requestId && e.text) onToken(e.text);
  });
  try {
    const res = await native.generate(requestId, prompt, {
      temperature: 0.3,
      topK: 40,
      topP: 0.95,
      randomSeed: 0,
      ...options,
    });
    return { text: res.text, cancelled: !!res.cancelled };
  } finally {
    sub.remove();
  }
}
