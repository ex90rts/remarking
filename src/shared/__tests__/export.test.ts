import { describe, expect, it } from "vitest";
import { createBackupJson, createMarkdownExport } from "../export";
import type { HighlightRecord, VocabularyRecord } from "../types";

const highlight: HighlightRecord = {
  id: "h1",
  urlKey: "https://example.com/doc",
  sourceUrl: "https://example.com/doc",
  sourceTitle: "Doc",
  selectedText: "A useful sentence.",
  color: "yellow",
  anchor: {
    selectedText: "A useful sentence.",
    prefixText: "",
    suffixText: "",
    textStart: 0,
    textEnd: 18
  },
  status: "active",
  createdAt: "2026-07-07T00:00:00.000Z",
  updatedAt: "2026-07-07T00:00:00.000Z"
};

const vocabulary: VocabularyRecord = {
  id: "v1",
  word: "useful",
  normalizedWord: "useful",
  sourceUrl: "https://example.com/doc",
  sourceTitle: "Doc",
  contextSentence: "A useful sentence.",
  translation: "有用的",
  createdAt: "2026-07-07T00:00:00.000Z",
  updatedAt: "2026-07-07T00:00:00.000Z"
};

describe("export helpers", () => {
  it("excludes sensitive settings by default", () => {
    const json = createBackupJson({
      settings: {
        llm: { apiKey: "secret" },
        pronunciation: { merriamWebsterApiKey: "dict-secret" }
      },
      highlights: [highlight],
      vocabulary: [vocabulary],
      explanations: [],
      includeSensitive: false
    });

    expect(json).not.toContain("secret");
    expect(json).not.toContain("dict-secret");
  });

  it("creates readable markdown", () => {
    const markdown = createMarkdownExport({ highlights: [highlight], vocabulary: [vocabulary] });
    expect(markdown).toContain("A useful sentence.");
    expect(markdown).toContain("useful");
  });
});
