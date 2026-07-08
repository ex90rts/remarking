import type { Messages } from "./types";

export const zhCN: Messages = {
  languageName: "中文简体",
  common: {
    appName: "Remarker",
    refresh: "刷新",
    created: "创建于",
    copied: "已复制",
    copy: "复制",
    cancel: "取消",
    delete: "删除",
    empty: "空",
    openSource: "打开来源"
  },
  popup: {
    loading: "加载中",
    failed: "失败",
    noSite: "无站点",
    enableExtension: "启用插件",
    enableCurrentSite: "启用当前站点",
    openManagementPage: "打开管理页面"
  },
  content: {
    copy: "复制",
    speak: "发音",
    explain: "解释",
    saveWord: "加入生词表",
    translate: "翻译",
    splitHighlight: "拆分划线",
    highlight: "划线",
    highlightColor: "划线：{{color}}",
    changeToColor: "改为 {{color}}",
    delete: "删除",
    explaining: "解释中",
    explainingProgress: "解释中...",
    explanation: "解释",
    translating: "翻译中",
    translatingProgress: "翻译中...",
    translation: "翻译",
    regenerate: "重新获取",
    copyExplanation: "复制解释",
    close: "关闭",
    copied: "已复制",
    savedHighlights: "已保存 {{count}} 条划线。"
  },
  options: {
    tabs: {
      highlights: "划线",
      vocabulary: "生词表",
      explanations: "解释记录",
      settings: "设置"
    },
    columns: {
      highlightedText: "划线文本",
      source: "来源",
      status: "状态",
      color: "颜色",
      actions: "操作",
      word: "单词",
      context: "上下文",
      audio: "发音"
    },
    actions: {
      copyHighlightedText: "复制划线文本",
      deleteHighlight: "删除划线",
      expandTranslation: "展开解释",
      collapseTranslation: "折叠解释",
      speakWord: "播放 {{word}} 发音",
      deleteVocabularyItem: "删除生词",
      copyExplanation: "复制解释",
      deleteExplanation: "删除解释",
      export: "导出",
      clearCache: "清空缓存",
      exportJson: "导出 JSON",
      exportMarkdown: "导出 Markdown",
      importJson: "导入 JSON",
      saveSettings: "保存设置"
    },
    confirmations: {
      deleteHighlight: "删除这条划线？",
      deleteVocabularyItem: "删除这个生词？",
      deleteExplanation: "删除这条解释？",
      clearExplanations: "清空所有解释缓存？"
    },
    settings: {
      llm: "大模型",
      baseUrl: "Base URL",
      apiKey: "API Key",
      model: "模型",
      temperature: "Temperature",
      timeoutMs: "超时时间 ms",
      promptTemplate: "提示词模板",
      promptTemplateHelp: "可用变量：{{task}}、{{selection}}、{{context}}",
      language: "语言",
      pronunciation: "发音",
      merriamWebsterApiKey: "Merriam-Webster API Key",
      preferences: "偏好",
      enableExtensionGlobally: "全局启用插件",
      defaultHighlightColor: "默认划线颜色",
      disabledSites: "停用站点",
      disabledSitesHelp: "每行一个 hostname，例如：example.com",
      importExport: "导入 / 导出",
      includeSensitiveConfig: "JSON 导出包含敏感配置"
    },
    notices: {
      settingsSaved: "设置已保存。",
      jsonImported: "JSON 已导入。"
    },
    statusDescriptions: {
      active: "这条划线已在来源页面恢复。",
      not_found: "来源页面中未找到保存的文本锚点。",
      ambiguous: "来源页面中匹配到多个位置，无法安全恢复。",
      pending: "这条划线尚未在来源页面完成恢复确认。"
    },
    export: {
      explanationsTitle: "解释记录",
      exported: "导出时间",
      source: "来源",
      model: "模型",
      untitled: "未命名"
    }
  }
};
