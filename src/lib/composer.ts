import type { SectionHit } from './types';
import type { Understanding } from './understand';
import { PLAYBOOKS } from './playbooks';
import { toBanglaDigits } from './understand';
import { actNameBn, gloss } from './glosses';

export type Composed = {
  text: string;
  followUps: string[];
  clarify?: { question: string; options: string[] };
};

const PENALTY_RE = /(কারাদণ্ড|অর্থদণ্ড|জরিমানা|দণ্ডিত)/;
const QUANTITY_RE = /([0-9০-৯]+|এক|দুই|তিন|চার|পাঁচ|ছয়|সাত|দশ|বৎসর|বছর|মাস|টাকা|লক্ষ|হাজার)/;
const isEnglish = (s: string) => !/[ঀ-৿]/.test(s);

function sentences(text: string): string[] {
  return text.replace(/\s+/g, ' ').split(/(?<=[।\.;])\s+/).map((x) => x.trim()).filter((x) => x.length > 12);
}
const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n).replace(/\s\S*$/, '') + '…' : s);

/** Bangla one-liner for a hit: Bangla statute → first sentence; English statute → gloss or null. */
function banglaGist(h: SectionHit): string | null {
  if (!isEnglish(h.text)) {
    const first = (sentences(h.text)[0] ?? h.text).replace(/^[\-–—:\s]+/, '');
    return clip(first, 230);
  }
  return gloss(h.act_title, h.no_ascii);
}

function refLabel(h: SectionHit) {
  return `${actNameBn(h.act_title)}, ধারা ${toBanglaDigits(h.no || '')}`.replace(/, ধারা $/, '');
}

/**
 * Lawyer-style Bangla answer from retrieved statute text:
 * direct answer → আইন কী বলে → শাস্তি → করণীয়. English statutes are shown via Bangla glosses;
 * the original text stays one tap away in the source cards.
 */
export function compose(question: string, u: Understanding, hits: SectionHit[]): Composed {
  const pb = PLAYBOOKS[u.topic] ?? PLAYBOOKS.general;
  const refOnly = u.conceptHits === 0 && u.sectionRefs.length > 0;

  if (!hits.length || (u.conceptHits === 0 && u.sectionRefs.length === 0)) {
    return {
      text: '',
      followUps: [],
      clarify: {
        question: 'একটু খুলে বলুন — কে, কী করেছে, আর বিষয়টা কোন ধরনের? নিচের কোনোটা মিললে বেছে নিন।',
        options: ['পুলিশ বা গ্রেফতার', 'গাড়ি বা ট্রাফিক', 'টাকা, চেক বা ঋণ', 'জমি বা বাড়ি ভাড়া', 'চাকরি ও বেতন', 'পারিবারিক বিষয়', 'অনলাইন হয়রানি', 'পণ্য বা দোকান'],
      },
    };
  }

  const top = hits.slice(0, refOnly ? 1 : 4);
  const lines: string[] = [];

  if (refOnly) {
    const h = top[0];
    const g = banglaGist(h);
    lines.push(`${refLabel(h)}${h.title && !isEnglish(h.title) ? ` (${h.title})` : ''}: ${g ?? 'এই ধারার মূল পাঠ ইংরেজিতে; নিচে উৎসে চাপ দিয়ে পুরোটা পড়ুন।'}`);
    if (hits.length > 1) {
      const others = hits.slice(1, 4).map((x) => actNameBn(x.act_title)).filter((v, i, a) => a.indexOf(v) === i);
      if (others.length) lines.push(`একই নম্বরের ধারা অন্য আইনেও আছে: ${others.join(', ')}।`);
    }
  } else {
    lines.push(pb.summary ?? 'বাংলাদেশের প্রচলিত আইনে এ বিষয়ে যা আছে, সহজ করে বলছি।');

    const gists: string[] = [];
    const untranslated: string[] = [];
    top.slice(0, 3).forEach((h, i) => {
      const g = banglaGist(h);
      if (g) gists.push(`• ${refLabel(h)} — ${g} [${i + 1}]`);
      else untranslated.push(`[${i + 1}]`);
    });
    if (gists.length) {
      lines.push('', 'আইন কী বলে', ...gists);
    }
    if (untranslated.length) {
      lines.push(`উৎস ${untranslated.join(' ')} এর মূল পাঠ ইংরেজিতে — "উৎস" বাটনে চাপ দিয়ে পড়ুন।`);
    }

    // Penalties: only from Bangla statute text (glosses already include penalties).
    const penalties: string[] = [];
    top.forEach((h, i) => {
      if (isEnglish(h.text)) return;
      for (const s of sentences(h.text)) {
        if (PENALTY_RE.test(s) && QUANTITY_RE.test(s) && penalties.length < 2 && !penalties.some((p) => p.includes(clip(s, 40)))) {
          penalties.push(`• ${clip(s, 240)} [${i + 1}]`);
        }
      }
    });
    if (penalties.length) lines.push('', 'শাস্তি ও পরিণতি', ...penalties);
  }

  lines.push('', 'এখন আপনার করণীয়');
  pb.steps.forEach((st, i) => lines.push(`${toBanglaDigits(i + 1)}. ${st}`));
  if (pb.helplines?.length) lines.push(pb.helplines.map((h) => `${h.name} ${toBanglaDigits(h.number)}`).join(' · '));

  if (top.some((h) => h.repealed)) lines.push('', 'লক্ষ্য করুন: উদ্ধৃত কোনো কোনো ধারা রহিত আইনের; হালনাগাদ আইন দেখে নিন।');

  const followUps = pb.followUps.filter((f) => !question.includes(f.slice(0, 8))).slice(0, 3);
  return { text: lines.join('\n'), followUps };
}

export const CLARIFY_QUERIES: Record<string, string> = {
  'পুলিশ বা গ্রেফতার': 'পুলিশ গ্রেফতার পরোয়ানা অধিকার',
  'গাড়ি বা ট্রাফিক': 'ট্রাফিক মোটরযান লাইসেন্স জরিমানা',
  'টাকা, চেক বা ঋণ': 'চেক ডিজঅনার ঋণ টাকা আদায়',
  'জমি বা বাড়ি ভাড়া': 'জমি দখল ভাড়াটিয়া উচ্ছেদ',
  'চাকরি ও বেতন': 'শ্রমিক মজুরি ছাঁটাই চাকরি',
  'পারিবারিক বিষয়': 'তালাক ভরণপোষণ যৌতুক বিবাহ',
  'অনলাইন হয়রানি': 'ডিজিটাল ফেসবুক হয়রানি হুমকি',
  'পণ্য বা দোকান': 'ভোক্তা মূল্য ভেজাল পণ্য',
};
