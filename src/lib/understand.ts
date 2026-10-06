import { BN_SUFFIXES, CONCEPTS, SITUATIONS, STOPWORDS, type Topic } from './lexicon';

const BN_DIGITS: Record<string, string> = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
const EN_TO_BN: Record<string, string> = Object.fromEntries(Object.entries(BN_DIGITS).map(([b, e]) => [e, b]));

export const toBanglaDigits = (s: string | number) => String(s).replace(/[0-9]/g, (d) => EN_TO_BN[d] ?? d);
export const toAsciiDigits = (s: string) => s.replace(/[০-৯]/g, (d) => BN_DIGITS[d] ?? d);

export function normalize(q: string) {
  return q.normalize('NFC').toLowerCase().replace(/[​‌]/g, '').trim();
}

export function tokenize(q: string): string[] {
  return normalize(q)
    .split(/[\s,।;:()\[\]{}\-–—"'`?!./\\|*+]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

/** All plausible stems of a Bangla token (the token itself first). */
export function stemCandidates(t: string): string[] {
  if (!/[\u0980-\u09ff]/.test(t) || t.length <= 3) return [t];
  const out = [t];
  for (const suf of BN_SUFFIXES) {
    if (t.endsWith(suf) && t.length - suf.length >= 3) out.push(t.slice(0, t.length - suf.length));
  }
  return out;
}

/** Conservative stem for unknown words: strip one suffix only if a 4+ char base remains. */
export function stemBn(t: string): string {
  if (!/[\u0980-\u09ff]/.test(t) || t.length <= 4) return t;
  for (const suf of BN_SUFFIXES) {
    if (t.endsWith(suf) && t.length - suf.length >= 4) return t.slice(0, t.length - suf.length);
  }
  return t;
}

// Lexicon normalised once (NFC) so precomposed/decomposed Bangla letters compare equal.
const NCONCEPTS = CONCEPTS.map((c) => ({ ...c, forms: c.forms.map(normalize), terms: c.terms.map((t) => t.normalize('NFC')) }));
const FORM_INDEX = new Map<string, (typeof NCONCEPTS)[number]>();
for (const c of NCONCEPTS) for (const f of c.forms) if (!f.includes(' ')) FORM_INDEX.set(f, c);
const NSTOP = new Set([...STOPWORDS].map(normalize));

export type Understanding = {
  /** groups of alternative search terms; each group is one concept */
  groups: string[][];
  actHints: string[];
  /** Explicit "ধারা ৩০২" style references */
  sectionRefs: string[];
  keywords: string[];
  isBangla: boolean;
  /** Dominant playbook topic (most frequent among matched concepts). */
  topic: Topic;
  topics: Topic[];
  /** number of lexicon concepts matched (0 = only unknown words) */
  conceptHits: number;
};

export function understand(query: string): Understanding {
  const text = normalize(query);
  const toks = tokenize(text);
  const groups: string[][] = [];
  const actHints = new Set<string>();
  const keywords: string[] = [];
  const topicVotes = new Map<Topic, number>();
  let conceptHits = 0;
  const vote = (tp?: Topic) => {
    conceptHits += 1;
    if (tp) topicVotes.set(tp, (topicVotes.get(tp) ?? 0) + 1);
  };
  const consumed = new Set<number>();

  // Situation patterns first – they carry the most signal and override topic votes.
  let situationTopic: Topic | null = null;
  for (const st of SITUATIONS) {
    if (st.re.test(text)) {
      groups.unshift(st.terms);
      st.actHints?.forEach((h) => actHints.add(h));
      conceptHits += 2;
      topicVotes.set(st.topic, (topicVotes.get(st.topic) ?? 0) + 3);
      situationTopic = situationTopic ?? st.topic;
    }
  }

  // Multi-word concept forms first (e.g. "legal aid", "trade license").
  for (const c of NCONCEPTS) {
    for (const form of c.forms) {
      if (!form.includes(' ')) continue;
      if (text.includes(form)) {
        groups.push(c.terms);
        vote(c.topic);
        c.actHints?.forEach((h) => actHints.add(h));
        form.split(' ').forEach((w) => {
          const i = toks.indexOf(w);
          if (i >= 0) consumed.add(i);
        });
      }
    }
  }

  toks.forEach((tok, i) => {
    if (consumed.has(i) || NSTOP.has(tok)) return;
    const cands = stemCandidates(tok);
    if (cands.some((c) => NSTOP.has(c))) return;
    const hit = cands.map((c) => FORM_INDEX.get(c)).find(Boolean);
    const stem = stemBn(tok);
    if (hit) {
      if (!groups.includes(hit.terms)) groups.push(hit.terms);
      vote(hit.topic);
      hit.actHints?.forEach((h) => actHints.add(h));
      keywords.push(hit.terms[0]);
      return;
    }
    // Unknown token: keep if it looks like a real word (Bangla, or latin >= 4 chars)
    if (/[ঀ-৿]/.test(tok) && stem.length >= 2) {
      groups.push([stem]);
      keywords.push(stem);
    } else if (/^[a-z]+$/.test(tok) && tok.length >= 4) {
      groups.push([tok]);
      keywords.push(tok);
    }
  });

  const sectionRefs: string[] = [];
  const re = /(?:ধারা|section|sec\.?|s\.)\s*([0-9০-৯]+[a-zA-Zক-হ]{0,2})/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) sectionRefs.push(toAsciiDigits(m[1]));

  // Spouse/family + beating/threat → domestic violence law is the most relevant act.
  if ((topicVotes.get('family') ?? 0) > 0 && groups.some((g) => g.includes('আঘাত') || g.includes('হুমকি'))) {
    actHints.add('পারিবারিক সহিংসতা');
    groups.push(['পারিবারিক সহিংসতা', 'নির্যাতন']);
  }
  const topics = [...topicVotes.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
  return { groups, actHints: [...actHints], sectionRefs, keywords, isBangla: /[ঀ-৿]/.test(text), topic: topics[0] ?? 'general', topics, conceptHits };
}

