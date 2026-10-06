import { File, Paths } from 'expo-file-system';

const SETTINGS_FILE = () => new File(Paths.document, 'settings.json');

export type Settings = {
  autoLoad: boolean;
  /** auto = GPU on 64-bit ARM phones when it works, otherwise CPU */
  backend: 'auto' | 'cpu' | 'gpu';
  includeRepealed: boolean;
  /** user dismissed the "enable offline AI" card in chat */
  aiCardDismissed: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  autoLoad: true,
  backend: 'auto',
  includeRepealed: false,
  aiCardDismissed: false,
};

export function loadSettings(): Settings {
  try {
    const f = SETTINGS_FILE();
    if (f.exists) return { ...DEFAULT_SETTINGS, ...JSON.parse(f.textSync()) };
  } catch {}
  return DEFAULT_SETTINGS;
}

export function saveSettings(s: Settings) {
  try {
    const f = SETTINGS_FILE();
    if (!f.exists) f.create();
    f.write(JSON.stringify(s));
  } catch {}
}
