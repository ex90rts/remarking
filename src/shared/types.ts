import type { SupportedLanguage } from "./i18n";

export type HighlightStatus = "pending" | "active" | "not_found" | "ambiguous";

export type HighlightColor = "yellow" | "green" | "blue" | "pink" | "purple";

export interface TextAnchor {
  selectedText: string;
  prefixText: string;
  suffixText: string;
  textStart: number;
  textEnd: number;
}

export interface HighlightRecord {
  id: string;
  urlKey: string;
  sourceUrl: string;
  sourceTitle: string;
  selectedText: string;
  color: HighlightColor;
  anchor: TextAnchor;
  status: HighlightStatus;
  createdAt: string;
  updatedAt: string;
}

export interface VocabularyRecord {
  id: string;
  word: string;
  normalizedWord: string;
  sourceUrl: string;
  sourceTitle: string;
  contextSentence: string;
  translation?: string;
  audioProvider?: string;
  audioUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LlmConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  temperature: number;
  timeoutMs: number;
  promptTemplate: string;
}

export interface PronunciationConfig {
  merriamWebsterApiKey: string;
}

export interface UiPreferences {
  defaultHighlightColor: HighlightColor;
  language: SupportedLanguage;
}

export interface AppSettings {
  llm: LlmConfig;
  pronunciation: PronunciationConfig;
  ui: UiPreferences;
}

export interface SiteSetting {
  hostname: string;
  enabled: boolean;
  updatedAt: string;
}

export interface ExplanationRecord {
  id: string;
  cacheKey: string;
  selectedText: string;
  context: string;
  contextHash: string;
  sourceUrl: string;
  sourceTitle: string;
  model: string;
  result: string;
  createdAt: string;
}

export interface StartupCache {
  globalEnabled: boolean;
  disabledSites: string[];
  schemaVersion: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  llm: {
    baseUrl: "https://api.openai.com/v1",
    apiKey: "",
    model: "gpt-4.1-mini",
    temperature: 0.2,
    timeoutMs: 30000,
    promptTemplate:
      "You help a Chinese reader study English technical documents.\n\nTask: {{task}}\n\nSelection:\n{{selection}}\n\nContext:\n{{context}}\n\nRequirements:\n- Answer in natural Chinese.\n- Stay grounded in the provided context.\n- If the task is word explanation, include the contextual meaning, part of speech when useful, and reusable English expression notes.\n- If the task is translation, translate the selected text according to the context and briefly explain key expressions when useful.\n- Return Markdown."
  },
  pronunciation: {
    merriamWebsterApiKey: ""
  },
  ui: {
    defaultHighlightColor: "yellow",
    language: "en"
  }
};

export const SCHEMA_VERSION = 1;
