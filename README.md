[English](README.md) | [简体中文](README.zh-CN.md)

# Remarker - AI Reading Assistant and Vocabulary Builder

Remarker is a local-first Chrome extension for deep web reading, language learning, contextual AI word lookup, and personal study notes. It lets readers highlight important passages, explain unfamiliar words and phrases with an OpenAI-compatible model, save vocabulary automatically, and restore highlights when revisiting the same page.

Remarker is useful for students, researchers, engineers, and language learners who read foreign-language articles, documentation, essays, papers, or long-form web content and want a private, repeatable workflow for understanding, collecting, and reviewing what they read.

Also described as: AI reading assistant, browser highlighter, Chrome vocabulary builder, contextual dictionary extension, web annotation tool, local-first study notes, and LLM-powered language learning extension.

## Project Snapshot

- Product: Browser extension for reading, highlighting, AI word explanation, vocabulary capture, and note export.
- Platform: Chrome-compatible browser extension built on Manifest V3.
- Primary workflow: Select text, highlight passages, explain words in context, save vocabulary, and revisit pages with restored annotations.
- Storage model: Local browser IndexedDB by default.
- AI model support: OpenAI-compatible providers and custom endpoints.
- Export formats: JSON for app data, Markdown for highlights and vocabulary.
- Interface languages: English, Simplified Chinese, Traditional Chinese, and Spanish.

## Why Remarker

- It connects reading and vocabulary learning in one flow instead of splitting highlights, dictionary lookup, and review into separate tools.
- It explains words and phrases using the surrounding sentence or paragraph, so the answer is grounded in the page you are reading.
- It automatically turns AI lookup results into vocabulary records, reducing manual note taking.
- It restores previous highlights and vocabulary marks on page revisit, making web reading cumulative.
- It keeps the database local by default and makes export explicit.

## Core Features

- Web page highlights: Highlight and save important passages on web pages, then view, filter, delete, and export them from the options page.
- Contextual AI word lookup: Select a word or phrase and call an OpenAI-compatible LLM to explain its meaning based on the surrounding context.
- Automatic vocabulary list: Save lookup results as vocabulary records automatically, including source URL, page title, context sentence, and explanation.
- Page revisit restoration: Reopen a page to restore previous highlights and vocabulary underlines, with vocabulary explanations available in place.
- Pronunciation fallback chain: Use Merriam-Webster audio, Free Dictionary audio, and browser speech synthesis as fallbacks.
- Data import and export: Export highlights and vocabulary to Markdown, and import or export key app data as JSON.
- Multilingual interface: Use the UI language as the target language for AI explanations and translations.
- Site-level control: Enable or disable Remarker per site and keep reading preferences configurable.

## Installation and Local Development

Install dependencies:

```sh
npm install
```

Type check:

```sh
npm run typecheck
```

Run tests:

```sh
npm test
```

Build the extension:

```sh
npm run build
```

The build output is written to `dist/`. To load Remarker locally, open the Chrome extensions page, enable developer mode, choose "Load unpacked", and select the `dist/` directory.

## Configuration

Configure the following in the Settings page:

- LLM provider preset or custom OpenAI-compatible endpoint.
- OpenAI-compatible `baseUrl`.
- API key.
- Model name.
- `temperature`.
- Request timeout.
- Prompt template.
- Merriam-Webster API key.
- Default highlight color.
- Page size for highlights and vocabulary.
- Site enablement and import/export preferences.

Provider presets currently include DeepSeek, OpenRouter, Gemini, Z.ai/GLM, Alibaba DashScope, ByteDance Volcengine, and custom OpenAI-compatible endpoints.

The prompt template must include these variables:

```txt
{{task}}
{{selection}}
{{context}}
```

## Data and Privacy

Remarker is local-first: highlights, vocabulary, settings, and cached explanations are stored in the browser's IndexedDB by default. The LLM API key is read and used by the extension background service worker and is not written into the page DOM.

When an AI lookup or translation is requested, the selected text and surrounding context are sent to the configured LLM endpoint so the model can answer in context. JSON exports exclude sensitive configuration by default and include it only when the user explicitly opts in.

## FAQ

### What is Remarker?

Remarker is a Chrome-compatible browser extension for highlighting web pages, explaining selected words or phrases with AI, saving vocabulary, and restoring reading notes when pages are revisited.

### Who is Remarker for?

Remarker is for language learners, researchers, students, developers, and heavy web readers who want to turn online reading into a searchable study and review workflow.

### Does Remarker require an AI provider?

AI word lookup and translation require a configured OpenAI-compatible provider or custom endpoint. Highlighting, local records, and export workflows are part of the extension itself.

### Where does Remarker store data?

Remarker stores app data locally in browser IndexedDB by default. Users can export highlights, vocabulary, and selected app data when needed.

### Which languages does Remarker support?

The interface supports English, Simplified Chinese, Traditional Chinese, and Spanish. The selected interface language is also used as the target language for AI explanations and translations.

## Tech Stack

- Vite + TypeScript
- Chrome Manifest V3
- React + Material UI options page
- Plain TypeScript content script with Shadow DOM
- IndexedDB local storage
- Vitest

## Roadmap

- Add a vocabulary review schedule based on the forgetting curve, turning the vocabulary list from a lookup log into a sustainable learning tool.
- Online sync: Support syncing highlights and vocabulary across devices.
