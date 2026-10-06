export type Act = {
  id: number;
  title: string;
  act_no: string | null;
  year: number | null;
  lang: 'bn' | 'en' | null;
  published: string | null;
  long_title: string | null;
  preamble: string | null;
  repealed: number;
  repeal_note: string | null;
  source_url: string | null;
  section_count: number;
};

export type Section = {
  id: number;
  act_id: number;
  ord: number;
  no: string;
  no_ascii: string;
  title: string;
  text: string;
  chapter: string;
};

export type SectionHit = Section & {
  act_title: string;
  act_year: number | null;
  repealed: number;
  score: number;
};

export type Citation = {
  index: number; // 1-based number used inside the answer text
  sectionId: number;
  actId: number;
  actTitle: string;
  sectionNo: string;
  sectionTitle: string;
  excerpt: string;
  repealed: boolean;
  sourceUrl: string | null;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  citations?: Citation[];
  mode?: 'model' | 'retrieval';
  streaming?: boolean;
  error?: string;
  /** suggested next questions shown as chips */
  followUps?: string[];
  /** clarification options shown as chips */
  options?: string[];
};
