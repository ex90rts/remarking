const SINGLE_WORD_PATTERN = /^[A-Za-z]+(?:[-'][A-Za-z]+)*$/;

export function isSingleEnglishWord(value: string): boolean {
  return SINGLE_WORD_PATTERN.test(value.trim());
}

export function normalizeWord(value: string): string {
  return value.trim().toLowerCase();
}

export function getSelectionKind(value: string): "word" | "phrase" {
  return isSingleEnglishWord(value) ? "word" : "phrase";
}
