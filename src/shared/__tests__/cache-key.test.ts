import { describe, expect, it } from "vitest";
import { createLookupCacheKey } from "../cache-key";

describe("createLookupCacheKey", () => {
  it("uses selected text, normalized context, source, and model", async () => {
    const first = await createLookupCacheKey({
      selectedText: "architecture",
      context: "A   stable architecture",
      sourceKey: "https://example.com/doc",
      model: "model-a",
      selectionKind: "word",
      promptTemplate: "Explain {{selection}}",
      targetLanguage: "Simplified Chinese"
    });
    const second = await createLookupCacheKey({
      selectedText: "architecture",
      context: "A stable architecture",
      sourceKey: "https://example.com/doc",
      model: "model-a",
      selectionKind: "word",
      promptTemplate: "Explain   {{selection}}",
      targetLanguage: "Simplified Chinese"
    });
    const third = await createLookupCacheKey({
      selectedText: "architecture",
      context: "A stable architecture",
      sourceKey: "https://example.com/doc",
      model: "model-b",
      selectionKind: "word",
      promptTemplate: "Explain {{selection}}",
      targetLanguage: "Simplified Chinese"
    });
    const fourth = await createLookupCacheKey({
      selectedText: "architecture",
      context: "A stable architecture",
      sourceKey: "https://example.com/doc",
      model: "model-a",
      selectionKind: "text",
      promptTemplate: "Explain {{selection}}",
      targetLanguage: "Simplified Chinese"
    });
    const fifth = await createLookupCacheKey({
      selectedText: "architecture",
      context: "A stable architecture",
      sourceKey: "https://example.com/doc",
      model: "model-a",
      selectionKind: "word",
      promptTemplate: "Translate {{selection}}",
      targetLanguage: "Simplified Chinese"
    });
    const sixth = await createLookupCacheKey({
      selectedText: "architecture",
      context: "A stable architecture",
      sourceKey: "https://example.com/doc",
      model: "model-a",
      selectionKind: "word",
      promptTemplate: "Explain {{selection}}",
      targetLanguage: "English"
    });
    const seventh = await createLookupCacheKey({
      selectedText: "architecture",
      context: "A stable architecture",
      sourceKey: "https://example.com/other-doc",
      model: "model-a",
      selectionKind: "word",
      promptTemplate: "Explain {{selection}}",
      targetLanguage: "Simplified Chinese"
    });

    expect(first.cacheKey).toBe(second.cacheKey);
    expect(first.cacheKey).not.toBe(third.cacheKey);
    expect(first.cacheKey).not.toBe(fourth.cacheKey);
    expect(first.cacheKey).not.toBe(fifth.cacheKey);
    expect(first.cacheKey).not.toBe(sixth.cacheKey);
    expect(first.cacheKey).not.toBe(seventh.cacheKey);
  });
});
