import type { Citation, SectionHit } from './types';
import { toBanglaDigits } from './understand';
import { actNameBn, gloss } from './glosses';

export const MAX_CONTEXT_CHARS = 300;
/** Tokens reserved for the model's answer – short on purpose: the model only adds a brief explanation. */
export const ANSWER_BUDGET = 180;

export function excerpt(text: string, n = 240) {
  const t = text.replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n).replace(/\s\S*$/, '') + '…' : t;
}

export function toCitations(hits: SectionHit[]): Citation[] {
  return hits.map((h, i) => ({
    index: i + 1,
    sectionId: h.id,
    actId: h.act_id,
    actTitle: h.act_title,
    sectionNo: h.no,
    sectionTitle: h.title,
    excerpt: excerpt(h.text),
    repealed: !!h.repealed,
    sourceUrl: null,
  }));
}

export function sectionLabel(c: { actTitle: string; sectionNo: string }) {
  const isBn = /[ঀ-৿]/.test(c.actTitle);
  return c.sectionNo ? `${c.actTitle}, ${isBn ? 'ধারা' : 'Section'} ${c.sectionNo}` : c.actTitle;
}

/** Share of Bangla letters among all letters in a string (0..1). */
export function banglaRatio(s: string) {
  const letters = s.match(/[\p{L}]/gu) ?? [];
  if (!letters.length) return 0;
  const bn = s.match(/[ঀ-৿]/g) ?? [];
  return bn.length / letters.length;
}

/**
 * Shrinks the context (fewer sections, no history) until the prompt fits the model's
 * KV cache. `countTokens` is the native tokenizer; -1 means unavailable.
 */
export function buildPromptWithinBudget(
  question: string,
  hits: SectionHit[],
  history: { role: 'user' | 'assistant'; text: string }[],
  maxTokens: number,
  countTokens: (t: string) => number,
): { prompt: string; used: SectionHit[] } {
  const budget = maxTokens - ANSWER_BUDGET;
  let k = Math.min(hits.length, 2);
  let hist = history;
  while (k >= 1) {
    const used = hits.slice(0, k);
    const prompt = buildPrompt(question, used, hist);
    const n = countTokens(prompt);
    if (n < 0 || n <= budget) return { prompt, used };
    if (hist.length) hist = [];
    else k -= 1;
  }
  return { prompt: buildPrompt(question, hits.slice(0, 1), []), used: hits.slice(0, 1) };
}

export function buildPrompt(question: string, hits: SectionHit[], history: { role: 'user' | 'assistant'; text: string }[] = []) {
  return buildExplainPrompt(question, hits, history);
}

/**
 * Short, fast prompt: the structured answer is already shown by the composer; the model only
 * writes a personal 3–4 sentence explanation in plain Bangla.
 */
export function buildExplainPrompt(question: string, hits: SectionHit[], history: { role: 'user' | 'assistant'; text: string }[] = []) {
  const ctx = hits
    .map((h, i) => {
      const g = gloss(h.act_title, h.no_ascii);
      const body = (g ?? h.text).replace(/\s+/g, ' ').trim();
      const trimmed = body.length > MAX_CONTEXT_CHARS ? body.slice(0, MAX_CONTEXT_CHARS) + '…' : body;
      return `[${i + 1}] ${actNameBn(h.act_title)}, ধারা ${h.no}: ${trimmed}`;
    })
    .join('\n');
  const prev = history.filter((m) => m.role === 'user').slice(-1)[0];
  return `<start_of_turn>user
তুমি বাংলাদেশের একজন অভিজ্ঞ আইনজীবী। নিচের ধারার ভিত্তিতে ব্যবহারকারীর পরিস্থিতি সহজ বাংলায় ৩-৪ বাক্যে বুঝিয়ে দাও। শুধু বাংলা লেখো, ইংরেজি শব্দ নয়। সংখ্যা বা সাল পুনরাবৃত্তি করো না। নতুন ধারা বা শাস্তি বানিয়ো না। যেখানে তথ্য নিচ্ছ সেখানে [1] বা [2] লেখো।

ধারা:
${ctx}
${prev ? `\nআগের প্রশ্ন: ${prev.text.slice(0, 120)}\n` : ''}
পরিস্থিতি: ${question}<end_of_turn>
<start_of_turn>model
`;
}

export function legacyBuildPrompt(question: string, hits: SectionHit[], history: { role: 'user' | 'assistant'; text: string }[] = []) {
  const ctx = hits
    .map((h, i) => {
      const body = h.text.replace(/\s+/g, ' ').trim();
      const trimmed = body.length > MAX_CONTEXT_CHARS ? body.slice(0, MAX_CONTEXT_CHARS) + '…' : body;
      const no = h.no ? `ধারা ${h.no}` : '';
      return `[${i + 1}] ${h.act_title}${no ? `, ${no}` : ''}${h.title ? ` (${h.title})` : ''}\n${trimmed}`;
    })
    .join('\n\n');

  const hist = history
    .slice(-2)
    .map((m) => `${m.role === 'user' ? 'প্রশ্ন' : 'উত্তর'}: ${m.text.replace(/\s+/g, ' ').slice(0, 200)}`)
    .join('\n');

  return `তুমি বাংলাদেশের একজন অভিজ্ঞ, বন্ধুসুলভ আইনজীবী। নিচে বাংলাদেশের আইনের প্রকৃত ধারা দেওয়া আছে। শুধু এগুলোর ভিত্তিতে ব্যবহারকারীর প্রশ্নের উত্তর দাও।

অবশ্যই মানতে হবে:
- উত্তর সম্পূর্ণ বাংলায় লেখো (Respond ONLY in Bengali). ধারা ইংরেজিতে থাকলেও বাংলায় সহজ করে বুঝিয়ে দাও।
- যে ধারা থেকে তথ্য নিচ্ছ, বাক্যের শেষে তার নম্বর বন্ধনীতে দাও, যেমন [1]। উপরে নেই এমন নম্বর দিও না।
- শাস্তি, জরিমানা বা ধারা নম্বর বানিয়ে লিখো না; ধারায় না থাকলে বলো "এই ধারায় তা বলা নেই"।
- গঠন: (১) দুই বাক্যে সরাসরি উত্তর, (২) আইন কী বলে ও শাস্তি/অধিকার, (৩) এখন আপনার করণীয় — ২ থেকে ৩টি ধাপ।
- ১৫০ শব্দের মধ্যে, সহজ ভাষায়, "আপনি" সম্বোধনে।

আইনের ধারা:
${ctx}
${hist ? `\nআগের কথোপকথন:\n${hist}\n` : ''}
প্রশ্ন: ${question}

বাংলায় উত্তর:`;
}

export function translatePrompt(text: string) {
  return `নিচের লেখাটি সহজ, স্বাভাবিক বাংলায় অনুবাদ করো। বন্ধনীর ভেতরের উৎস নম্বর যেমন [1] অপরিবর্তিত রাখো। শুধু অনুবাদ লেখো।\n\n${text}\n\nবাংলা অনুবাদ:`;
}

/** Extract [n] / [১] style markers from an answer; returns 1-based indices in order of appearance. */
export function citedIndices(answer: string, max: number): number[] {
  const out: number[] = [];
  const re = /\[\s*([0-9০-৯]+)\s*\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(answer))) {
    const n = parseInt(m[1].replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d))), 10);
    if (n >= 1 && n <= max && !out.includes(n)) out.push(n);
  }
  return out;
}

/** Display helper: [1] -> [১] */
export function banglaizeMarkers(answer: string) {
  return answer.replace(/\[\s*([0-9]+)\s*\]/g, (_, n) => `[${toBanglaDigits(n)}]`);
}

/**
 * Degeneration guard for small models: true when the text repeats the same 4-word window
 * three or more times, or the same short line keeps coming back.
 */
export function looksDegenerate(text: string): boolean {
  const words = text.replace(/\s+/g, ' ').trim().split(' ');
  if (words.length < 16) return false;
  const seen = new Map<string, number>();
  for (let i = 0; i + 4 <= words.length; i++) {
    const k = words.slice(i, i + 4).join(' ');
    const n = (seen.get(k) ?? 0) + 1;
    seen.set(k, n);
    if (n >= 3) return true;
  }
  return false;
}

/** Light cleanup of model output (stray markdown, repeated blank lines). */
export function tidyAnswer(s: string) {
  return s
    .replace(/\*\*/g, '')
    .replace(/^#+\s*/gm, '')
    .replace(/<end_of_turn>|<start_of_turn>|<eos>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Deterministic answer used when the on-device model is not available. */
export function retrievalOnlyAnswer(hits: SectionHit[]): string {
  if (!hits.length) {
    return 'আপনার প্রশ্নের সাথে মিলে এমন কোনো ধারা পাইনি। ঘটনাটি আরেকটু খুলে লিখুন — কে, কী করেছে, কোন বিষয়ে (যেমন পুলিশ, জমি, চেক, চাকরি)।';
  }
  const top = hits.slice(0, 3);
  const lines = top.map((h, i) => {
    const no = h.no ? `ধারা ${h.no}` : '';
    return `[${i + 1}] ${h.act_title}${no ? `, ${no}` : ''}${h.title ? ` — ${h.title}` : ''}\n${excerpt(h.text, 300)}`;
  });
  return `আপনার প্রশ্নের সাথে সম্পর্কিত আইনের ধারা:\n\n${lines.join('\n\n')}\n\nপুরো ধারা পড়তে "উৎস" বাটনে চাপ দিন। অফলাইন এআই চালু করলে এই ধারাগুলোর ভিত্তিতে আপনার পরিস্থিতি সহজ বাংলায় বুঝিয়ে দেওয়া হবে।`;
}

export const DISCLAIMER = 'এটি সাধারণ আইনি তথ্য, আইনজীবীর পরামর্শের বিকল্প নয়। জরুরি প্রয়োজনে ৯৯৯ · সরকারি আইনি সহায়তা ১৬৪৩০';
