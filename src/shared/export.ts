import type { ExplanationRecord, HighlightRecord, VocabularyRecord } from "./types";

export function createBackupJson(input: {
  settings: unknown;
  highlights: HighlightRecord[];
  vocabulary: VocabularyRecord[];
  explanations: ExplanationRecord[];
  includeSensitive: boolean;
}): string {
  const settings = structuredClone(input.settings) as Record<string, unknown>;

  if (!input.includeSensitive && typeof settings.llm === "object" && settings.llm) {
    (settings.llm as Record<string, unknown>).apiKey = "";
  }

  if (!input.includeSensitive && typeof settings.pronunciation === "object" && settings.pronunciation) {
    (settings.pronunciation as Record<string, unknown>).merriamWebsterApiKey = "";
  }

  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      schemaVersion: 1,
      settings,
      highlights: input.highlights,
      vocabulary: input.vocabulary,
      explanations: input.explanations
    },
    null,
    2
  );
}

export function createMarkdownExport(input: {
  highlights: HighlightRecord[];
  vocabulary: VocabularyRecord[];
}): string {
  const highlightsByPage = new Map<string, HighlightRecord[]>();
  for (const highlight of input.highlights) {
    const key = `${highlight.sourceTitle || "Untitled"}\n${highlight.sourceUrl}`;
    highlightsByPage.set(key, [...(highlightsByPage.get(key) ?? []), highlight]);
  }

  const lines = ["# Remarker Export", "", `Exported: ${new Date().toISOString()}`, ""];

  for (const [key, highlights] of highlightsByPage.entries()) {
    const [title, url] = key.split("\n");
    lines.push(`## ${title}`, "", `Source: ${url}`, "", "### Highlights", "");
    for (const highlight of highlights) {
      lines.push(`- ${highlight.selectedText}`);
      lines.push(`  - Color: ${highlight.color}`);
      lines.push(`  - Created: ${highlight.createdAt}`);
    }
    lines.push("");
  }

  if (input.vocabulary.length > 0) {
    lines.push("## Vocabulary", "");
    for (const item of input.vocabulary) {
      lines.push(`- ${item.word}`);
      if (item.translation) lines.push(`  - Meaning: ${item.translation}`);
      if (item.contextSentence) lines.push(`  - Context: ${item.contextSentence}`);
      lines.push(`  - Source: ${item.sourceUrl}`);
      lines.push(`  - Created: ${item.createdAt}`);
    }
  }

  return lines.join("\n");
}
