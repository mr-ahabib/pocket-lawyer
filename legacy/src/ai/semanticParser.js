// Systematic Semantic Parser & Intent Classifier for Bangla Legal Queries
// Analyzes conversational Bangla questions and systematically maps to Legal Concepts & Decision Paths

import { BANGLADESH_LAWS } from '../database/lawData';

const INTENT_RULES = [
  {
    intent: "traffic_police",
    category: "Traffic",
    decisionNode: "traffic_start",
    synonyms: [
      "পুলিশ", "ট্রাফিক", "গাড়ি", "বাইক", "মোটরসাইকেল", "সার্জেন্ট", "লাইসেন্স",
      "কাগজপত্র", "ট্যাক্স টোকেন", "ফিটনেস", "হেলমেট", "উল্টো পথ", "জরিমানা",
      "সিজ", "চাবি", "মামলা", "ধরেছে", "আটকেছে"
    ]
  },
  {
    intent: "police_arrest",
    category: "Police",
    decisionNode: "police_start",
    synonyms: [
      "গ্রেপ্তার", "আটক", "ওয়ারেন্ট", "পরোয়ানা", "তল্লাশি", "রেইড", "লকআপ",
      "থানা", "হাজত", "৫৪ ধারা", "রিমান্ড", "মারধর", "নির্যাতন", "জিডি", "হুমকি"
    ]
  },
  {
    intent: "consumer_overpricing",
    category: "Consumer",
    decisionNode: "consumer_start",
    synonyms: [
      "বেশি দাম", "খুচরা মূল্য", "mrp", "দোকানদার", "ভেজাল", "পচা", "মেয়াদোত্তীর্ণ",
      "ওজনে কম", "বাটখারা", "ঠকিয়েছে", "১৬১২১", "ভোক্তা", "ক্যাশ মেমো"
    ]
  },
  {
    intent: "land_eviction",
    category: "Land",
    decisionNode: "land_start",
    synonyms: [
      "জমি দখল", "বেদখল", "উচ্ছেদ", "বাড়িওয়ালা", "ভাড়াটিয়া", "বাড়িভাড়া",
      "নোটিশ", "জাল দলিল", "নামজারি", "খতিয়ান", "৯ ধারা", "পর্চা", "বাউন্ডারি"
    ]
  },
  {
    intent: "cyber_harassment",
    category: "Cyber",
    decisionNode: "cyber_start",
    synonyms: [
      "ব্ল্যাকমেইল", "ছবি ভাইরাল", "ভিডিও", "হ্যাক", "আইডি হ্যাক", "ফেসবুক",
      "পাসওয়ার্ড", "হয়রানি", "অশ্লীল", "বুলিং", "টাকা চায়"
    ]
  },
  {
    intent: "financial_cheque",
    category: "Finance",
    decisionNode: "finance_start",
    synonyms: [
      "চেক", "বাউন্স", "ডিজঅনার", "১৩৮ ধারা", "ব্যাংক চেক", "টাকা মেরে দিয়েছে",
      "আত্মসাৎ", "প্রতারণা", "৪২০ ধারা", "ধার নিয়ে দেয় না", "লিগ্যাল নোটিশ"
    ]
  },
  {
    intent: "domestic_protection",
    category: "Family",
    decisionNode: "root",
    synonyms: [
      "যৌতুক", "মারধর", "পারিবারিক নির্যাতন", "ডিভোর্স", "খোরপোশ",
      "ইভটিজিং", "১০৯", "নারী নির্যাতন", "শালীনতাহানি"
    ]
  }
];

export const analyzeQuery = (query) => {
  if (!query || typeof query !== 'string' || query.trim() === '') {
    return {
      topIntent: null,
      suggestedDecisionNode: 'root',
      rankedLaws: BANGLADESH_LAWS.slice(0, 5),
      confidence: 0
    };
  }

  const cleanQuery = query.toLowerCase().trim();
  const words = cleanQuery.split(/[\s,।!?]+/);

  // Score each intent rule systematically
  let bestIntent = null;
  let maxIntentScore = 0;

  INTENT_RULES.forEach(rule => {
    let score = 0;
    rule.synonyms.forEach(synonym => {
      if (cleanQuery.includes(synonym)) {
        score += 3;
      }
      words.forEach(w => {
        if (w === synonym) {
          score += 2;
        } else if (w.length > 3 && synonym.includes(w)) {
          score += 1;
        }
      });
    });

    if (score > maxIntentScore) {
      maxIntentScore = score;
      bestIntent = rule;
    }
  });

  // Calculate systematic relevance score for each law in database
  const scoredLaws = BANGLADESH_LAWS.map(law => {
    let lawScore = 0;

    // Check exact matches
    if (cleanQuery.includes(law.section.toLowerCase())) lawScore += 15;
    if (cleanQuery.includes(law.title.toLowerCase())) lawScore += 10;
    if (cleanQuery.includes(law.act_name.toLowerCase())) lawScore += 8;

    // Keyword match
    if (law.keywords) {
      law.keywords.forEach(kw => {
        if (cleanQuery.includes(kw.toLowerCase())) {
          lawScore += 5;
        }
      });
    }

    // Situation & citizen action match
    words.forEach(w => {
      if (w.length > 2) {
        if (law.offense_situation.toLowerCase().includes(w)) lawScore += 2;
        if (law.citizen_action.toLowerCase().includes(w)) lawScore += 2;
        if (law.title.toLowerCase().includes(w)) lawScore += 3;
      }
    });

    // Intent category boost
    if (bestIntent && law.category === bestIntent.category) {
      lawScore += 7;
    }

    return { ...law, score: lawScore };
  });

  // Sort descending by score
  const filtered = scoredLaws
    .filter(l => l.score > 0)
    .sort((a, b) => b.score - a.score);

  return {
    topIntent: bestIntent ? bestIntent.intent : null,
    suggestedCategory: bestIntent ? bestIntent.category : null,
    suggestedDecisionNode: bestIntent ? bestIntent.decisionNode : 'root',
    rankedLaws: filtered.length > 0 ? filtered : BANGLADESH_LAWS.slice(0, 4),
    confidence: maxIntentScore
  };
};
