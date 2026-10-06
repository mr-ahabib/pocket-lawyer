import type { SQLiteDatabase } from 'expo-sqlite';
import { ftsTerm, searchSectionsFts, sectionsByNumber } from './db';
import type { SectionHit } from './types';
import { understand, type Understanding } from './understand';

export * from './understand';

/** Nation-wide codes that usually answer a citizen's question; boosted in ranking. */
const CORE_ACTS = [
  'penal code', 'criminal procedure', 'civil procedure', 'evidence act', 'contract act', 'transfer of property', 'negotiable instruments',
  'specific relief', 'limitation act', 'registration act', 'constitution', 'guardians and wards', 'muslim family', 'dissolution of muslim marriages',
  'সংবিধান', 'শ্রম আইন, ২০০৬', 'ভোক্তা', 'সড়ক পরিবহণ', 'নারী ও শিশু নির্যাতন দমন আইন', 'যৌতুক নিরোধ', 'বাড়ী ভাড়া', 'ডিজিটাল', 'সাইবার', 'মাদকদ্রব্য', 'নিরাপদ খাদ্য',
  'পারিবারিক সহিংসতা', 'আইনগত সহায়তা', 'তথ্য অধিকার', 'পর্নোগ্রাফি', 'মানব পাচার', 'শিশু আইন', 'ভূমি', 'দুর্নীতি দমন',
].map((k) => k.normalize('NFC').toLowerCase());
/** Acts limited to one city / institution; demoted unless the query names them. */
const LOCAL_ACTS = ['মহানগরী', 'metropolitan', 'ক্যান্টনমেন্ট', 'cantonment', 'ইপিজেড', 'epz', 'পোর্ট', 'port authority', 'বিশ্ববিদ্যালয়', 'university', 'সিটি কর্পোরেশন', 'city corporation'].map((k) => k.normalize('NFC').toLowerCase());

function groupToFts(group: string[]): string {
  const parts = group.map((t) => ftsTerm(t)).filter(Boolean);
  return parts.length > 1 ? `(${parts.join(' OR ')})` : parts[0] ?? '';
}

export type RetrievalResult = { hits: SectionHit[]; understanding: Understanding; strategy: 'and' | 'or' | 'none' };

/**
 * Hybrid retrieval: strict AND over concept groups, relaxed to OR, then re-ranked with
 * act-hint boosts, recency and de-duplication (max 3 sections per act).
 */
export async function retrieve(db: SQLiteDatabase, query: string, opts: { limit?: number; includeRepealed?: boolean } = {}): Promise<RetrievalResult> {
  const u = understand(query);
  const limit = opts.limit ?? 8;
  // Pure numbers are section references, not search words.
  const groups = u.groups.filter((g) => !g.every((t) => /^[0-9০-৯]+$/.test(t))).map(groupToFts).filter(Boolean);
  if (!groups.length && !u.sectionRefs.length) return { hits: [], understanding: u, strategy: 'none' };

  let strategy: RetrievalResult['strategy'] = 'and';
  let raw: SectionHit[] = [];
  const run = async (match: string) => {
    try {
      return await searchSectionsFts(db, match, { limit: 160, includeRepealed: opts.includeRepealed });
    } catch {
      return [] as SectionHit[];
    }
  };
  // Explicit "ধারা ৩০২" style references: look the number up directly as well.
  for (const ref of u.sectionRefs.slice(0, 2)) {
    try {
      raw.push(...(await sectionsByNumber(db, ref, opts.includeRepealed)));
    } catch {}
  }
  if (groups.length > 1) raw.push(...(await run(groups.join(' AND '))));
  if (raw.length < 12 && groups.length) {
    strategy = groups.length > 1 ? 'or' : 'and';
    const more = await run(groups.join(' OR '));
    const seen = new Set(raw.map((h) => h.id));
    for (const h of more) if (!seen.has(h.id)) raw.push(h);
  }
  // de-duplicate (a section can arrive from both the number lookup and FTS)
  raw = raw.filter((h, i, arr) => arr.findIndex((x) => x.id === h.id) === i);

  // Explicit section number reference: boost matching section numbers heavily.
  const refs = new Set(u.sectionRefs);
  const scored = raw.map((h) => {
    let s = -h.score * 0.5; // bm25 is negative-better; flip & damp so topical boosts matter
    const actTitleN = h.act_title.normalize('NFC').toLowerCase();
    if (u.actHints.some((hint) => actTitleN.includes(hint.normalize('NFC').toLowerCase()))) s += 8;
    if (refs.size && refs.has(h.no_ascii)) s += 10;
    // A bare "ধারা ৩০২" almost always means the Penal Code / CrPC.
    if (refs.size && u.conceptHits === 0 && /penal code|criminal procedure|দণ্ডবিধি|ফৌজদারি কার্যবিধি/.test(actTitleN)) s += 8;
    if (h.act_year && h.act_year >= 2000) s += 1.5;
    if (h.act_year && h.act_year < 1950) s -= 0.5;
    if (/সংজ্ঞা|definitions?/i.test(h.title)) s -= 2;
    if (/সংক্ষিপ্ত শিরোনাম|short title|commencement/i.test(h.title)) s -= 4;
    if (u.isBangla && /[ঀ-৿]/.test(h.act_title)) s += 1;
    if (CORE_ACTS.some((k) => actTitleN.includes(k))) s += 3;
    if (LOCAL_ACTS.some((k) => actTitleN.includes(k))) s -= 8;
    if (/\(amendment\)|সংশোধন/i.test(actTitleN)) s -= 2;
    if (h.text.length < 60) s -= 1;
    // Section heading that names the user's concepts is a strong relevance signal.
    const titleN = h.title.normalize('NFC').toLowerCase();
    for (const g of u.groups) if (g.some((t) => titleN.includes(t.normalize('NFC').toLowerCase().split(' ')[0]))) s += 2.5;
    return { h, s };
  });
  scored.sort((a, b) => b.s - a.s);

  const perAct = new Map<number, number>();
  const hits: SectionHit[] = [];
  const onlyRefs = refs.size > 0 && u.conceptHits === 0;
  for (const { h, s } of scored) {
    if (onlyRefs && !refs.has(h.no_ascii)) continue;
    const n = perAct.get(h.act_id) ?? 0;
    if (n >= 3) continue;
    perAct.set(h.act_id, n + 1);
    hits.push({ ...h, score: s });
    if (hits.length >= (onlyRefs ? 3 : limit)) break;
  }
  return { hits, understanding: u, strategy };
}
