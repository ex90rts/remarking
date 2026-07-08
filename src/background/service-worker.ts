import { createExplanationCacheKey } from "../shared/cache-key";
import type { RuntimeMessage, PronunciationResult } from "../shared/messages";
import {
  clearStore,
  deleteFromStore,
  getAllFromStore,
  getExplanationByCacheKey,
  getHighlightsForUrl,
  getSettings,
  importSnapshot,
  putInStore,
  saveSettings
} from "../shared/repositories/db";
import type {
  ExplanationRecord,
  HighlightRecord,
  HighlightStatus,
  VocabularyRecord
} from "../shared/types";

chrome.runtime.onInstalled.addListener(async () => {
  const cache = await chrome.storage.local.get(["globalEnabled", "disabledSites", "schemaVersion"]);
  await chrome.storage.local.set({
    globalEnabled: cache.globalEnabled ?? true,
    disabledSites: cache.disabledSites ?? [],
    schemaVersion: cache.schemaVersion ?? 1
  });
});

chrome.runtime.onMessage.addListener((message: RuntimeMessage, _sender, sendResponse) => {
  handleMessage(message)
    .then((result) => sendResponse({ ok: true, result }))
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : "Unknown error";
      sendResponse({ ok: false, error: message });
    });
  return true;
});

async function handleMessage(message: RuntimeMessage): Promise<unknown> {
  switch (message.type) {
    case "GET_HIGHLIGHTS_FOR_URL":
      return getHighlightsForUrl(message.urlKey);

    case "SAVE_HIGHLIGHT":
      await putInStore("highlights", message.record);
      return message.record;

    case "UPDATE_HIGHLIGHT_STATUS":
      return updateHighlightStatus(message.id, message.status);

    case "UPDATE_HIGHLIGHT_COLOR":
      return updateHighlightColor(message.id, message.color);

    case "DELETE_HIGHLIGHT":
      await deleteFromStore("highlights", message.id);
      return { id: message.id };

    case "SAVE_VOCABULARY":
      await putInStore("vocabulary", message.record);
      return message.record;

    case "DELETE_VOCABULARY":
      await deleteFromStore("vocabulary", message.id);
      return { id: message.id };

    case "EXPLAIN_SELECTION":
      return explainSelection(message);

    case "GET_PRONUNCIATION":
      return getPronunciation(message.word);

    case "GET_SETTINGS":
      return getSettings();

    case "SAVE_SETTINGS":
      await saveSettings(message.settings);
      return message.settings;

    case "LIST_ALL_DATA": {
      const [highlights, vocabulary, explanations, settings] = await Promise.all([
        getAllFromStore<HighlightRecord>("highlights"),
        getAllFromStore<VocabularyRecord>("vocabulary"),
        getAllFromStore<ExplanationRecord>("explanations"),
        getSettings()
      ]);
      return { highlights, vocabulary, explanations, settings };
    }

    case "IMPORT_SNAPSHOT":
      await importSnapshot(message.snapshot);
      return { imported: true };

    case "DELETE_EXPLANATION":
      await deleteFromStore("explanations", message.id);
      return { id: message.id };

    case "CLEAR_EXPLANATIONS":
      await clearStore("explanations");
      return { cleared: true };
  }
}

async function updateHighlightStatus(id: string, status: HighlightStatus): Promise<HighlightRecord | undefined> {
  const highlights = await getAllFromStore<HighlightRecord>("highlights");
  const record = highlights.find((item) => item.id === id);
  if (!record) return undefined;

  const next = { ...record, status, updatedAt: new Date().toISOString() };
  await putInStore("highlights", next);
  return next;
}

async function updateHighlightColor(id: string, color: HighlightRecord["color"]): Promise<HighlightRecord | undefined> {
  const highlights = await getAllFromStore<HighlightRecord>("highlights");
  const record = highlights.find((item) => item.id === id);
  if (!record) return undefined;

  const next = { ...record, color, updatedAt: new Date().toISOString() };
  await putInStore("highlights", next);
  return next;
}

async function explainSelection(input: Extract<RuntimeMessage, { type: "EXPLAIN_SELECTION" }>): Promise<ExplanationRecord> {
  const settings = await getSettings();
  const { cacheKey, contextHash } = await createExplanationCacheKey({
    selectedText: input.selectedText,
    context: input.context,
    model: settings.llm.model,
    selectionKind: input.selectionKind,
    promptTemplate: settings.llm.promptTemplate
  });

  const cached = await getExplanationByCacheKey(cacheKey);
  if (cached && !input.forceRefresh) return cached;

  if (!settings.llm.apiKey.trim()) {
    throw new Error("LLM API key is not configured.");
  }

  const result = await callOpenAiCompatibleApi({
    baseUrl: settings.llm.baseUrl,
    apiKey: settings.llm.apiKey,
    model: settings.llm.model,
    temperature: settings.llm.temperature,
    timeoutMs: settings.llm.timeoutMs,
    promptTemplate: settings.llm.promptTemplate,
    selectionKind: input.selectionKind,
    selectedText: input.selectedText,
    context: input.context
  });

  const record: ExplanationRecord = {
    id: cached?.id ?? crypto.randomUUID(),
    cacheKey,
    selectedText: input.selectedText,
    context: input.context,
    contextHash,
    sourceUrl: input.sourceUrl,
    sourceTitle: input.sourceTitle,
    model: settings.llm.model,
    result,
    createdAt: new Date().toISOString()
  };

  await putInStore("explanations", record);
  return record;
}

async function callOpenAiCompatibleApi(input: {
  baseUrl: string;
  apiKey: string;
  model: string;
  temperature: number;
  timeoutMs: number;
  promptTemplate: string;
  selectionKind: "word" | "text";
  selectedText: string;
  context: string;
}): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), input.timeoutMs);
  const baseUrl = input.baseUrl.replace(/\/$/, "");
  const prompt = renderPromptTemplate(input.promptTemplate, {
    task:
      input.selectionKind === "word"
        ? "Explain the selected English word in context."
        : "Translate the selected text according to the provided context.",
    selection: input.selectedText,
    context: input.context
  });

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${input.apiKey}`
      },
      body: JSON.stringify({
        model: input.model,
        temperature: input.temperature,
        messages: [
          {
            role: "system",
            content: "Follow the user's prompt template exactly. Return Markdown."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`LLM request failed: ${response.status}`);
    }

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = json.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error("LLM response did not include content.");
    return content;
  } finally {
    clearTimeout(timeoutId);
  }
}

function renderPromptTemplate(
  template: string,
  values: { task: string; selection: string; context: string }
): string {
  return template
    .replaceAll("{{task}}", values.task)
    .replaceAll("{{selection}}", values.selection)
    .replaceAll("{{context}}", values.context);
}

async function getPronunciation(word: string): Promise<PronunciationResult> {
  const settings = await getSettings();
  const apiKey = settings.pronunciation.merriamWebsterApiKey.trim();

  if (apiKey) {
    const result = await getMerriamWebsterAudio(word, apiKey).catch(() => undefined);
    if (result) return result;
  }

  const freeDictionary = await getFreeDictionaryAudio(word).catch(() => undefined);
  return freeDictionary ?? { provider: "speech-synthesis" };
}

async function getMerriamWebsterAudio(word: string, apiKey: string): Promise<PronunciationResult | undefined> {
  const response = await fetch(
    `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${encodeURIComponent(word)}?key=${encodeURIComponent(apiKey)}`
  );
  if (!response.ok) return undefined;

  const data = (await response.json()) as Array<{ hwi?: { prs?: Array<{ sound?: { audio?: string } }> } }>;
  const audio = data.find((entry) => entry.hwi?.prs?.some((pronunciation) => pronunciation.sound?.audio))?.hwi
    ?.prs?.[0]?.sound?.audio;
  if (!audio) return undefined;

  const subdirectory = getMerriamWebsterAudioSubdirectory(audio);
  return {
    provider: "merriam-webster",
    audioUrl: `https://media.merriam-webster.com/audio/prons/en/us/mp3/${subdirectory}/${audio}.mp3`
  };
}

function getMerriamWebsterAudioSubdirectory(audio: string): string {
  if (audio.startsWith("bix")) return "bix";
  if (audio.startsWith("gg")) return "gg";
  const first = audio[0]?.toLowerCase();
  return first && /^[a-z]$/.test(first) ? first : "number";
}

async function getFreeDictionaryAudio(word: string): Promise<PronunciationResult | undefined> {
  const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
  if (!response.ok) return undefined;

  const data = (await response.json()) as Array<{ phonetics?: Array<{ audio?: string }> }>;
  const audioUrl = data
    .flatMap((entry) => entry.phonetics ?? [])
    .map((phonetic) => phonetic.audio)
    .find((audio): audio is string => Boolean(audio));

  if (!audioUrl) return undefined;
  return { provider: "free-dictionary", audioUrl };
}
