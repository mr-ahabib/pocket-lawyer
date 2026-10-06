import { Asset } from 'expo-asset';
import { Directory, File, FileMode } from 'expo-file-system';
import { defaultDatabaseDirectory } from 'expo-sqlite';
import { Gunzip } from 'fflate';
import { DB_NAME } from './db';

// Metro treats .gz as an asset (metro.config.js); the file is ~17 MB instead of ~100 MB.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const DB_GZ = require('../../assets/db/bdlaws.db.gz');

const CHUNK = 1 << 20; // 1 MiB

export type BootstrapProgress = (fraction: number) => void;

/**
 * Makes sure the current law database exists in SQLite's directory, inflating it from the
 * bundled .gz on first launch (streaming, so peak memory stays small). Older versions are removed.
 */
export async function ensureDatabase(onProgress?: BootstrapProgress): Promise<void> {
  const base = String(defaultDatabaseDirectory);
  const dir = new Directory(base.startsWith('file://') ? base : `file://${base}`);
  if (!dir.exists) dir.create({ intermediates: true });
  const target = new File(dir, DB_NAME);
  if (target.exists && (target.size ?? 0) > 50 * 1024 * 1024) return;

  // drop stale databases from previous versions
  try {
    for (const item of dir.list()) {
      if (item instanceof File && /^bdlaws.*\.db(-journal|-wal|-shm)?$/.test(item.name) && !item.name.startsWith(DB_NAME)) item.delete();
    }
  } catch {}

  const asset = Asset.fromModule(DB_GZ);
  await asset.downloadAsync();
  if (!asset.localUri) throw new Error('database asset missing');

  const src = new File(asset.localUri);
  const tmp = new File(dir, `${DB_NAME}.part`);
  if (tmp.exists) tmp.delete();
  tmp.create();

  const input = src.open(FileMode.ReadOnly);
  const output = tmp.open(FileMode.WriteOnly);
  const total = input.size ?? src.size ?? 1;
  let read = 0;
  try {
    const gz = new Gunzip((chunk) => output.writeBytes(chunk));
    while (read < total) {
      const n = Math.min(CHUNK, total - read);
      const bytes = input.readBytes(n);
      if (!bytes.length) break;
      read += bytes.length;
      gz.push(bytes, read >= total);
      onProgress?.(read / total);
      // let the UI breathe between chunks
      await new Promise((r) => setTimeout(r, 0));
    }
  } finally {
    input.close();
    output.close();
  }
  if (target.exists) target.delete();
  tmp.move(target);
}
