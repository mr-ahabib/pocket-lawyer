import type { SQLiteDatabase } from 'expo-sqlite';
import type { Act, Section, SectionHit } from './types';

// bump the suffix whenever assets/db/bdlaws.db is rebuilt so the asset is re-imported
export const DB_NAME = 'bdlaws-v20261005d.db';

export async function getMeta(db: SQLiteDatabase): Promise<Record<string, string>> {
  const rows = await db.getAllAsync<{ key: string; value: string }>('SELECT key, value FROM meta');
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function getAct(db: SQLiteDatabase, id: number): Promise<Act | null> {
  return db.getFirstAsync<Act>('SELECT * FROM acts WHERE id = ?', id);
}

export async function getSections(db: SQLiteDatabase, actId: number): Promise<Section[]> {
  return db.getAllAsync<Section>('SELECT * FROM sections WHERE act_id = ? ORDER BY ord', actId);
}

export async function getSection(db: SQLiteDatabase, id: number): Promise<(Section & { act_title: string; source_url: string | null; repealed: number }) | null> {
  return db.getFirstAsync(
    `SELECT s.*, a.title AS act_title, a.source_url, a.repealed FROM sections s JOIN acts a ON a.id = s.act_id WHERE s.id = ?`,
    id,
  );
}

export async function getFootnotes(db: SQLiteDatabase, actId: number): Promise<string[]> {
  const rows = await db.getAllAsync<{ text: string }>('SELECT text FROM footnotes WHERE act_id = ? ORDER BY ord', actId);
  return rows.map((r) => r.text);
}

export type ActFilter = { lang?: 'bn' | 'en'; includeRepealed?: boolean; query?: string; limit?: number; offset?: number };

export async function listActs(db: SQLiteDatabase, f: ActFilter = {}): Promise<Act[]> {
  const where: string[] = [];
  const params: (string | number)[] = [];
  if (!f.includeRepealed) where.push('a.repealed = 0');
  if (f.lang) {
    where.push('a.lang = ?');
    params.push(f.lang);
  }
  const limit = f.limit ?? 60;
  const offset = f.offset ?? 0;
  if (f.query && f.query.trim()) {
    const match = buildMatch(f.query);
    if (match) {
      const sql = `SELECT a.* FROM acts_fts JOIN acts a ON a.id = acts_fts.rowid
        WHERE acts_fts MATCH ? ${where.length ? 'AND ' + where.join(' AND ') : ''}
        ORDER BY a.repealed ASC, bm25(acts_fts) ASC, a.year DESC LIMIT ? OFFSET ?`;
      try {
        return await db.getAllAsync<Act>(sql, [match, ...params, limit, offset]);
      } catch {
        // fall through to LIKE
      }
    }
    where.push('a.title LIKE ?');
    params.push(`%${f.query.trim()}%`);
  }
  const sql = `SELECT a.* FROM acts a ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY a.year DESC, a.id DESC LIMIT ? OFFSET ?`;
  return db.getAllAsync<Act>(sql, [...params, limit, offset]);
}

export async function countActs(db: SQLiteDatabase): Promise<{ total: number; inForce: number; sections: number }> {
  const r = await db.getFirstAsync<{ total: number; inForce: number }>(
    'SELECT COUNT(*) AS total, SUM(CASE WHEN repealed = 0 THEN 1 ELSE 0 END) AS inForce FROM acts',
  );
  const s = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) AS c FROM sections');
  return { total: r?.total ?? 0, inForce: r?.inForce ?? 0, sections: s?.c ?? 0 };
}

/** Full-text search over sections. `match` must be a valid FTS5 query. */
export async function searchSectionsFts(
  db: SQLiteDatabase,
  match: string,
  opts: { limit?: number; includeRepealed?: boolean; actId?: number } = {},
): Promise<SectionHit[]> {
  const limit = opts.limit ?? 40;
  const cond: string[] = [];
  const params: (string | number)[] = [match];
  if (!opts.includeRepealed) cond.push('a.repealed = 0');
  if (opts.actId) {
    cond.push('s.act_id = ?');
    params.push(opts.actId);
  }
  const sql = `SELECT s.*, a.title AS act_title, a.year AS act_year, a.repealed,
      bm25(sections_fts, 6.0, 1.0) AS score
    FROM sections_fts JOIN sections s ON s.id = sections_fts.rowid JOIN acts a ON a.id = s.act_id
    WHERE sections_fts MATCH ? ${cond.length ? 'AND ' + cond.join(' AND ') : ''}
    ORDER BY score ASC LIMIT ?`;
  params.push(limit);
  return db.getAllAsync<SectionHit>(sql, params);
}

/** Sections with a given number (ASCII digits), e.g. "302" or "54A" – across all acts in force. */
export async function sectionsByNumber(db: SQLiteDatabase, noAscii: string, includeRepealed = false): Promise<SectionHit[]> {
  const sql = `SELECT s.*, a.title AS act_title, a.year AS act_year, a.repealed, -20.0 AS score
    FROM sections s JOIN acts a ON a.id = s.act_id
    WHERE s.no_ascii = ? ${includeRepealed ? '' : 'AND a.repealed = 0'} LIMIT 40`;
  return db.getAllAsync<SectionHit>(sql, [noAscii.toUpperCase()]);
}

/** Escape a user term for FTS5 and add prefix matching. */
export function ftsTerm(term: string, prefix = true): string {
  const t = term.replace(/"/g, '').normalize('NFC').trim();
  if (!t) return '';
  // The FTS index is built with detail=none (no phrase queries) – multi-word terms become AND groups.
  const words = t.split(/\s+/).filter(Boolean);
  const parts = words.map((w) => `"${w}"${prefix ? '*' : ''}`);
  return parts.length > 1 ? `(${parts.join(' AND ')})` : parts[0];
}

export function buildMatch(query: string): string {
  const toks = query
    .normalize('NFC')
    .split(/[\s,।;:()\-–—"'`?!./]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1);
  if (!toks.length) return '';
  return toks.map((t) => ftsTerm(t)).join(' AND ');
}
