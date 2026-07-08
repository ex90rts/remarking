import { describe, expect, it } from "vitest";
import { createExplanationCacheKey } from "../cache-key";

describe("createExplanationCacheKey", () => {
  it("uses selected text, normalized context, and model", async () => {
    const first = await createExplanationCacheKey({
      selectedText: "architecture",
      context: "A   stable architecture",
      model: "model-a",
      selectionKind: "word",
      promptTemplate: "Explain {{selection}}"
    });
    const second = await createExplanationCacheKey({
      selectedText: "architecture",
      context: "A stable architecture",
      model: "model-a",
      selectionKind: "word",
      promptTemplate: "Explain   {{selection}}"
    });
    const third = await createExplanationCacheKey({
      selectedText: "architecture",
      context: "A stable architecture",
      model: "model-b",
      selectionKind: "word",
      promptTemplate: "Explain {{selection}}"
    });
    const fourth = await createExplanationCacheKey({
      selectedText: "architecture",
      context: "A stable architecture",
      model: "model-a",
      selectionKind: "text",
      promptTemplate: "Explain {{selection}}"
    });
    const fifth = await createExplanationCacheKey({
      selectedText: "architecture",
      context: "A stable architecture",
      model: "model-a",
      selectionKind: "word",
      promptTemplate: "Translate {{selection}}"
    });

    expect(first.cacheKey).toBe(second.cacheKey);
    expect(first.cacheKey).not.toBe(third.cacheKey);
    expect(first.cacheKey).not.toBe(fourth.cacheKey);
    expect(first.cacheKey).not.toBe(fifth.cacheKey);
  });
});
