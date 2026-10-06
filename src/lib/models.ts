import { Directory, File, Paths } from 'expo-file-system';

/**
 * On-device model catalogue. The app never shows these names to the user – it only
 * talks about "অফলাইন এআই". Files are Google Gemma checkpoints packaged for MediaPipe
 * LLM Inference (.task). `urls` are tried in order; none of them needs a login.
 */
export type ModelSpec = {
  id: string;
  sizeBytes: number;
  minRamBytes: number;
  urls: string[];
  fileName: string;
  /** KV-cache length the .task was exported with – prompt + answer must fit. */
  maxTokens: number;
};

const GB = 1024 * 1024 * 1024;
const MB = 1024 * 1024;

export const MODELS: ModelSpec[] = [
  {
    id: 'gemma3-1b-it-int4',
    sizeBytes: 554661243,
    minRamBytes: 3 * GB,
    urls: [
      'https://huggingface.co/K4N4T/gemma3-1B-it-int4.task/resolve/main/gemma3-1B-it-int4.task',
      'https://huggingface.co/litert-community/Gemma3-1B-IT/resolve/main/gemma3-1b-it-int4.task',
    ],
    fileName: 'gemma3-1b-it-int4.task',
    maxTokens: 1280,
  },
];

export const DEFAULT_MODEL = MODELS[0];

export const modelsDir = () => new Directory(Paths.document, 'models');
export const modelFile = (spec: ModelSpec) => new File(modelsDir(), spec.fileName);

export function isDownloaded(spec: ModelSpec) {
  try {
    const f = modelFile(spec);
    // Allow a little slack for mirrors, but reject tiny error pages / truncated files.
    return f.exists && (f.size ?? 0) >= spec.sizeBytes * 0.98;
  } catch {
    return false;
  }
}

export function deleteModel(spec: ModelSpec) {
  try {
    const f = modelFile(spec);
    if (f.exists) f.delete();
  } catch {}
}

export function fmtBytes(n: number) {
  if (n >= GB) return `${(n / GB).toFixed(1)} GB`;
  if (n >= MB) return `${Math.round(n / MB)} MB`;
  return `${Math.round(n / 1024)} KB`;
}

export type ProgressCb = (written: number, total: number) => void;

export async function downloadModel(spec: ModelSpec, onProgress: ProgressCb, signal: AbortSignal) {
  const dir = modelsDir();
  if (!dir.exists) dir.create({ intermediates: true });
  const dest = modelFile(spec);
  let lastError: unknown = null;
  for (const url of spec.urls) {
    if (signal.aborted) throw new Error('aborted');
    try {
      if (dest.exists) dest.delete();
    } catch {}
    try {
      const task = File.createDownloadTask(url, dest, {
        signal,
        onProgress: ({ bytesWritten, totalBytes }) => onProgress(bytesWritten, totalBytes > 0 ? totalBytes : spec.sizeBytes),
      });
      await task.downloadAsync();
      if (dest.exists && (dest.size ?? 0) >= spec.sizeBytes * 0.98) return dest;
      lastError = new Error('incomplete');
    } catch (e) {
      if (signal.aborted) throw e;
      lastError = e;
    }
  }
  try {
    if (dest.exists) dest.delete();
  } catch {}
  throw new Error(`ডাউনলোড সম্পন্ন হয়নি। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন। (${(lastError as any)?.message ?? ''})`.trim());
}
