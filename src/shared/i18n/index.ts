import { en } from "./en";
import { es } from "./es";
import { zhCN } from "./zh-CN";
import { zhTW } from "./zh-TW";
import type { Messages } from "./types";

export type { Messages };

export type SupportedLanguage = "zh-CN" | "zh-TW" | "en" | "es";

export const LANGUAGE_OPTIONS: Array<{ value: SupportedLanguage; label: string }> = [
  { value: "zh-CN", label: zhCN.languageName },
  { value: "zh-TW", label: zhTW.languageName },
  { value: "en", label: en.languageName },
  { value: "es", label: es.languageName }
];

const messages: Record<SupportedLanguage, Messages> = {
  "zh-CN": zhCN,
  "zh-TW": zhTW,
  en,
  es
};

export function getMessages(language: SupportedLanguage): Messages {
  return messages[language] ?? en;
}

export function detectBrowserLanguage(): SupportedLanguage {
  const language = globalThis.navigator?.language?.toLowerCase() ?? "";

  if (language === "zh-cn" || language === "zh-hans" || language.startsWith("zh-hans-")) return "zh-CN";
  if (
    language === "zh-tw" ||
    language === "zh-hk" ||
    language === "zh-mo" ||
    language === "zh-hant" ||
    language.startsWith("zh-hant-")
  ) {
    return "zh-TW";
  }
  if (language.startsWith("zh")) return "zh-CN";
  if (language.startsWith("es")) return "es";
  return "en";
}

export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => String(values[key] ?? ""));
}
