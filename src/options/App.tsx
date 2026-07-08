import {
  Alert,
  AppBar,
  Box,
  Button,
  Checkbox,
  Chip,
  Collapse,
  Container,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Popover,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Toolbar,
  Typography
} from "@mui/material";
import {
  ChevronDown,
  ChevronRight,
  Check,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Github,
  Highlighter,
  Languages,
  RefreshCcw,
  Settings,
  Trash2,
  Upload,
  Volume2
} from "lucide-react";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { createBackupJson, createMarkdownExport } from "../shared/export";
import { detectBrowserLanguage, getMessages, interpolate, LANGUAGE_OPTIONS } from "../shared/i18n";
import type { Messages } from "../shared/i18n";
import { markdownToSafeHtml } from "../shared/markdown";
import type { ListAllDataResult, PronunciationResult, RuntimeMessage } from "../shared/messages";
import type { AppSettings, ExplanationRecord, HighlightColor, HighlightRecord, HighlightStatus, VocabularyRecord } from "../shared/types";

type TabKey = "highlights" | "vocabulary" | "explanations" | "settings";

const tabKeys: TabKey[] = ["highlights", "vocabulary", "explanations", "settings"];

const HIGHLIGHT_COLORS: Record<HighlightColor, string> = {
  yellow: "#ffe66d",
  green: "#b7f7c2",
  blue: "#b8ddff",
  pink: "#ffc2d4",
  purple: "#d8c7ff"
};

const REMARKING_GITHUB_URL = "https://github.com/ex90rts/remarking";

const markdownBodySx = {
  "& p": { my: 1 },
  "& ul": { my: 1, pl: 3 },
  "& blockquote": { borderLeft: "3px solid #cbd5e1", m: 0, pl: 2, color: "text.secondary" },
  "& pre": { p: 1.5, bgcolor: "#f1f5f9", borderRadius: 1, overflow: "auto" },
  "& code": { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", bgcolor: "#f1f5f9", px: 0.5, borderRadius: 0.5 },
  "& table": { width: "100%", borderCollapse: "collapse", my: 1.25, display: "block", overflowX: "auto" },
  "& th, & td": { border: "1px solid #cbd5e1", px: 1, py: 0.75, textAlign: "left", verticalAlign: "top" },
  "& th": { bgcolor: "#f8fafc", fontWeight: 700 }
};

export function App() {
  const [tab, setTab] = useState<TabKey>("highlights");
  const [data, setData] = useState<ListAllDataResult | undefined>();
  const [notice, setNotice] = useState<string>("");
  const [includeSensitive, setIncludeSensitive] = useState(false);
  const language = data?.settings.ui.language ?? detectBrowserLanguage();
  const t = getMessages(language);

  useEffect(() => {
    void reload();
  }, []);

  async function reload() {
    const result = await sendMessage<ListAllDataResult>({ type: "LIST_ALL_DATA" });
    setData(result);
  }

  const counts = useMemo(
    () => ({
      highlights: data?.highlights.length ?? 0,
      vocabulary: data?.vocabulary.length ?? 0,
      explanations: data?.explanations.length ?? 0
    }),
    [data]
  );

  return (
    <Box minHeight="100vh">
      <AppBar position="sticky" elevation={0} color="inherit">
        <Toolbar sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
          <Highlighter size={22} />
          <Typography variant="h6" sx={{ ml: 1, flexGrow: 1 }}>
            {t.common.appName}
          </Typography>
          <Button startIcon={<Github size={16} />} href={REMARKING_GITHUB_URL} target="_blank" rel="noreferrer">
            GitHub
          </Button>
          <Button startIcon={<RefreshCcw size={16} />} onClick={reload}>
            {t.common.refresh}
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        {notice ? (
          <Alert severity="success" onClose={() => setNotice("")} sx={{ mb: 2 }}>
            {notice}
          </Alert>
        ) : null}

        <Paper variant="outlined">
          <Tabs value={tab} onChange={(_, value: TabKey) => setTab(value)} sx={{ px: 2, borderBottom: 1, borderColor: "divider" }}>
            <Tab value="highlights" icon={<Highlighter size={16} />} iconPosition="start" label={`${t.options.tabs.highlights} (${counts.highlights})`} />
            <Tab value="vocabulary" icon={<Languages size={16} />} iconPosition="start" label={`${t.options.tabs.vocabulary} (${counts.vocabulary})`} />
            <Tab value="explanations" icon={<FileText size={16} />} iconPosition="start" label={`${t.options.tabs.explanations} (${counts.explanations})`} />
            <Tab value="settings" icon={<Settings size={16} />} iconPosition="start" label={t.options.tabs.settings} />
          </Tabs>

          <Box p={2}>
            {tab === "highlights" && <HighlightsTab highlights={data?.highlights ?? []} onChange={reload} t={t} />}
            {tab === "vocabulary" && <VocabularyTab vocabulary={data?.vocabulary ?? []} onChange={reload} t={t} />}
            {tab === "explanations" && <ExplanationsTab explanations={data?.explanations ?? []} onChange={reload} t={t} />}
            {tab === "settings" && data && (
              <SettingsTab
                data={data}
                includeSensitive={includeSensitive}
                setIncludeSensitive={setIncludeSensitive}
                setNotice={setNotice}
                onChange={reload}
                t={t}
              />
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

function HighlightsTab({ highlights, onChange, t }: { highlights: HighlightRecord[]; onChange: () => void; t: Messages }) {
  const sortedHighlights = sortByCreatedAtDesc(highlights);

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>{t.options.columns.highlightedText}</TableCell>
          <TableCell>{t.options.columns.source}</TableCell>
          <TableCell>{t.options.columns.status}</TableCell>
          <TableCell>{t.options.columns.color}</TableCell>
          <TableCell align="right">{t.options.columns.actions}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {sortedHighlights.map((highlight) => (
          <TableRow key={highlight.id}>
            <TableCell sx={{ maxWidth: 420 }}>
              <Typography component="div" variant="body2">
                {highlight.selectedText}
              </Typography>
              <Typography component="div" variant="caption" color="text.secondary">
                {t.common.created} {formatCreatedAt(highlight.createdAt)}
              </Typography>
            </TableCell>
            <TableCell>{highlight.sourceTitle || highlight.sourceUrl}</TableCell>
            <TableCell>
              <Chip size="small" label={highlight.status} title={getHighlightStatusDescription(highlight.status, t)} />
            </TableCell>
            <TableCell>
              <Box
                component="span"
                title={highlight.color}
                sx={{
                  display: "inline-block",
                  width: 22,
                  height: 22,
                  borderRadius: "6px",
                  border: "1px solid rgba(15, 23, 42, 0.16)",
                  bgcolor: HIGHLIGHT_COLORS[highlight.color],
                  verticalAlign: "middle"
                }}
              />
            </TableCell>
            <TableCell align="right">
              <CopyIconButton label={t.options.actions.copyHighlightedText} text={highlight.selectedText} t={t} />
              <IconButton href={highlight.sourceUrl} target="_blank" aria-label={t.common.openSource}>
                <ExternalLink size={16} />
              </IconButton>
              <ConfirmDeleteIconButton
                label={t.options.actions.deleteHighlight}
                message={t.options.confirmations.deleteHighlight}
                onConfirm={async () => {
                  await sendMessage({ type: "DELETE_HIGHLIGHT", id: highlight.id });
                  onChange();
                }}
                t={t}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function VocabularyTab({ vocabulary, onChange, t }: { vocabulary: VocabularyRecord[]; onChange: () => void; t: Messages }) {
  const sortedVocabulary = sortByCreatedAtDesc(vocabulary);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  return (
    <Table size="small" sx={{ tableLayout: "fixed", width: "100%" }}>
      <colgroup>
        <col style={{ width: 48 }} />
        <col style={{ width: 260 }} />
        <col />
        <col style={{ width: 260 }} />
        <col style={{ width: 72 }} />
        <col style={{ width: 120 }} />
      </colgroup>
      <TableHead>
        <TableRow>
          <TableCell />
          <TableCell>{t.options.columns.word}</TableCell>
          <TableCell>{t.options.columns.context}</TableCell>
          <TableCell>{t.options.columns.source}</TableCell>
          <TableCell>{t.options.columns.audio}</TableCell>
          <TableCell align="right">{t.options.columns.actions}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {sortedVocabulary.map((item) => (
          <Fragment key={item.id}>
            <TableRow>
              <TableCell>
                <IconButton
                  size="small"
                  aria-label={expandedRows[item.id] ? t.options.actions.collapseTranslation : t.options.actions.expandTranslation}
                  onClick={() => setExpandedRows((rows) => ({ ...rows, [item.id]: !rows[item.id] }))}
                >
                  {expandedRows[item.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </IconButton>
              </TableCell>
              <TableCell sx={{ width: 260 }}>
                <Typography component="div" variant="body2" fontWeight={600}>
                  {item.word}
                </Typography>
                <Typography component="div" variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                  {t.common.created} {formatCreatedAt(item.createdAt)}
                </Typography>
              </TableCell>
              <TableCell sx={{ overflowWrap: "anywhere" }}>
                <Typography
                  component="div"
                  variant="body2"
                  sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden"
                  }}
                >
                  {item.contextSentence}
                </Typography>
              </TableCell>
              <TableCell sx={{ overflowWrap: "anywhere" }}>{item.sourceTitle || item.sourceUrl}</TableCell>
              <TableCell>
                <IconButton aria-label={interpolate(t.options.actions.speakWord, { word: item.word })} onClick={() => speakWord(item.word)}>
                  <Volume2 size={16} />
                </IconButton>
              </TableCell>
              <TableCell align="right">
                <IconButton href={item.sourceUrl} target="_blank" aria-label={t.common.openSource}>
                  <ExternalLink size={16} />
                </IconButton>
                <ConfirmDeleteIconButton
                  label={t.options.actions.deleteVocabularyItem}
                  message={t.options.confirmations.deleteVocabularyItem}
                  onConfirm={async () => {
                    await sendMessage({ type: "DELETE_VOCABULARY", id: item.id });
                    onChange();
                  }}
                  t={t}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={6} sx={{ py: 0, borderBottom: expandedRows[item.id] ? undefined : 0 }}>
                <Collapse in={Boolean(expandedRows[item.id])} timeout="auto" unmountOnExit>
                  <Box sx={{ px: 2, py: 1.5, ml: 5 }}>
                    <Box sx={{ bgcolor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 1, p: 1.5, mb: 1.5 }}>
                      <Typography variant="caption" color="text.secondary" component="div" sx={{ mb: 0.5 }}>
                        {t.options.columns.context}
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                        {renderHighlightedContext(item.contextSentence || t.common.empty, item.word)}
                      </Typography>
                    </Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {t.content.explanation}
                      </Typography>
                      <CopyIconButton label={t.options.actions.copyExplanation} text={item.translation || ""} t={t} />
                    </Stack>
                    <Box
                      className="markdown-body"
                      sx={{
                        color: item.translation ? "text.primary" : "text.secondary",
                        fontSize: 14,
                        lineHeight: 1.65,
                        overflowWrap: "anywhere",
                        ...markdownBodySx
                      }}
                      dangerouslySetInnerHTML={{ __html: markdownToSafeHtml(item.translation || t.common.empty) }}
                    />
                  </Box>
                </Collapse>
              </TableCell>
            </TableRow>
          </Fragment>
        ))}
      </TableBody>
    </Table>
  );
}

function ExplanationsTab({ explanations, onChange, t }: { explanations: ExplanationRecord[]; onChange: () => void; t: Messages }) {
  const sortedExplanations = sortByCreatedAtDesc(explanations);
  const recentExplanations = sortedExplanations.slice(0, 10);

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button
          startIcon={<Download size={16} />}
          onClick={() => downloadFile("remarker-explanations.md", createExplanationsMarkdownExport(sortedExplanations, t), "text/markdown")}
        >
          {t.options.actions.export}
        </Button>
        <ConfirmDeleteButton
          message={t.options.confirmations.clearExplanations}
          onConfirm={async () => {
            await sendMessage({ type: "CLEAR_EXPLANATIONS" });
            onChange();
          }}
          t={t}
        >
          {t.options.actions.clearCache}
        </ConfirmDeleteButton>
      </Stack>
      {recentExplanations.map((item) => (
        <Paper variant="outlined" sx={{ p: 2 }} key={item.id}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography fontWeight={600}>{item.selectedText}</Typography>
              <Typography component="div" variant="caption" color="text.secondary">
                {t.common.created} {formatCreatedAt(item.createdAt)}
              </Typography>
            </Box>
            <Stack direction="row" spacing={0.5}>
              <CopyIconButton label={t.options.actions.copyExplanation} text={item.result} t={t} />
              <ConfirmDeleteIconButton
                label={t.options.actions.deleteExplanation}
                message={t.options.confirmations.deleteExplanation}
                onConfirm={async () => {
                  await sendMessage({ type: "DELETE_EXPLANATION", id: item.id });
                  onChange();
                }}
                t={t}
              />
            </Stack>
          </Stack>
          <Box
            className="markdown-body"
            sx={{
              mt: 1,
              fontSize: 14,
              lineHeight: 1.65,
              ...markdownBodySx
            }}
            dangerouslySetInnerHTML={{ __html: markdownToSafeHtml(item.result) }}
          />
          <Typography variant="caption" color="text.secondary">
            {item.model} · {item.sourceTitle || item.sourceUrl}
          </Typography>
        </Paper>
      ))}
    </Stack>
  );
}

function CopyIconButton({ label, text, t }: { label: string; text: string; t: Messages }) {
  const [isCopied, setIsCopied] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      if (timerRef.current !== undefined) window.clearTimeout(timerRef.current);
    },
    []
  );

  async function copyText() {
    await navigator.clipboard.writeText(text);
    setIsCopied(true);
    if (timerRef.current !== undefined) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setIsCopied(false);
      timerRef.current = undefined;
    }, 2000);
  }

  return (
    <IconButton
      aria-label={isCopied ? t.common.copied : label}
      title={isCopied ? t.common.copied : label}
      onClick={copyText}
      sx={
        isCopied
          ? {
              color: "#067647",
              bgcolor: "#ecfdf3",
              "&:hover": { bgcolor: "#d1fadf" }
            }
          : undefined
      }
    >
      {isCopied ? <Check size={16} /> : <Copy size={16} />}
    </IconButton>
  );
}

function ConfirmDeleteIconButton({
  label,
  message,
  onConfirm,
  t
}: {
  label: string;
  message: string;
  onConfirm: () => Promise<void> | void;
  t: Messages;
}) {
  return (
    <ConfirmPopover message={message} onConfirm={onConfirm} t={t}>
      {({ open }) => (
        <IconButton aria-label={label} color="error" onClick={open}>
          <Trash2 size={16} />
        </IconButton>
      )}
    </ConfirmPopover>
  );
}

function ConfirmDeleteButton({
  children,
  message,
  onConfirm,
  t
}: {
  children: ReactNode;
  message: string;
  onConfirm: () => Promise<void> | void;
  t: Messages;
}) {
  return (
    <ConfirmPopover message={message} onConfirm={onConfirm} t={t}>
      {({ open }) => (
        <Button startIcon={<Trash2 size={16} />} color="error" onClick={open} sx={{ alignSelf: "flex-start" }}>
          {children}
        </Button>
      )}
    </ConfirmPopover>
  );
}

function ConfirmPopover({
  children,
  message,
  onConfirm,
  t
}: {
  children: (props: { open: (event: MouseEvent<HTMLElement>) => void }) => ReactNode;
  message: string;
  onConfirm: () => Promise<void> | void;
  t: Messages;
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const close = () => {
    if (!isSubmitting) setAnchorEl(null);
  };

  return (
    <>
      {children({ open: (event) => setAnchorEl(event.currentTarget) })}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Stack spacing={1.25} sx={{ p: 1.5, maxWidth: 240 }}>
          <Typography variant="body2">{message}</Typography>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button size="small" onClick={close} disabled={isSubmitting}>
              {t.common.cancel}
            </Button>
            <Button
              size="small"
              color="error"
              variant="contained"
              disabled={isSubmitting}
              onClick={async () => {
                setIsSubmitting(true);
                try {
                  await onConfirm();
                  setAnchorEl(null);
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              {t.common.delete}
            </Button>
          </Stack>
        </Stack>
      </Popover>
    </>
  );
}

function SettingsTab({
  data,
  includeSensitive,
  setIncludeSensitive,
  setNotice,
  onChange,
  t
}: {
  data: ListAllDataResult;
  includeSensitive: boolean;
  setIncludeSensitive: (value: boolean) => void;
  setNotice: (value: string) => void;
  onChange: () => void;
  t: Messages;
}) {
  const [settings, setSettings] = useState<AppSettings>(data.settings);
  const [globalEnabled, setGlobalEnabled] = useState(true);
  const [disabledSitesText, setDisabledSitesText] = useState("");

  useEffect(() => setSettings(data.settings), [data.settings]);
  useEffect(() => {
    chrome.storage.local.get(["globalEnabled", "disabledSites"]).then((cache) => {
      setGlobalEnabled(cache.globalEnabled ?? true);
      setDisabledSitesText(Array.isArray(cache.disabledSites) ? cache.disabledSites.join("\n") : "");
    });
  }, []);

  async function saveSettings() {
    await sendMessage({ type: "SAVE_SETTINGS", settings });
    await chrome.storage.local.set({
      globalEnabled,
      disabledSites: disabledSitesText
        .split("\n")
        .map((site) => site.trim().toLowerCase())
        .filter(Boolean)
    });
    setNotice(t.options.notices.settingsSaved);
    onChange();
  }

  function download(filename: string, content: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importJson(file: File) {
    const text = await file.text();
    const parsed = JSON.parse(text) as {
      settings?: AppSettings;
      highlights?: HighlightRecord[];
      vocabulary?: VocabularyRecord[];
      explanations?: ExplanationRecord[];
    };
    await sendMessage({ type: "IMPORT_SNAPSHOT", snapshot: parsed });
    setNotice(t.options.notices.jsonImported);
    onChange();
  }

  return (
    <Stack spacing={3} maxWidth={760}>
      <Typography variant="h6">{t.options.settings.language}</Typography>
      <TextField
        select
        label={t.options.settings.language}
        value={settings.ui.language}
        onChange={(event) =>
          setSettings({
            ...settings,
            ui: { ...settings.ui, language: event.target.value as AppSettings["ui"]["language"] }
          })
        }
      >
        {LANGUAGE_OPTIONS.map((language) => (
          <MenuItem key={language.value} value={language.value}>
            {language.label}
          </MenuItem>
        ))}
      </TextField>

      <Typography variant="h6">{t.options.settings.llm}</Typography>
      <TextField label={t.options.settings.baseUrl} value={settings.llm.baseUrl} onChange={(event) => setSettings({ ...settings, llm: { ...settings.llm, baseUrl: event.target.value } })} />
      <TextField label={t.options.settings.apiKey} type="password" value={settings.llm.apiKey} onChange={(event) => setSettings({ ...settings, llm: { ...settings.llm, apiKey: event.target.value } })} />
      <TextField label={t.options.settings.model} value={settings.llm.model} onChange={(event) => setSettings({ ...settings, llm: { ...settings.llm, model: event.target.value } })} />
      <Stack direction="row" spacing={2}>
        <TextField
          label={t.options.settings.temperature}
          type="number"
          value={settings.llm.temperature}
          onChange={(event) => setSettings({ ...settings, llm: { ...settings.llm, temperature: Number(event.target.value) } })}
        />
        <TextField
          label={t.options.settings.timeoutMs}
          type="number"
          value={settings.llm.timeoutMs}
          onChange={(event) => setSettings({ ...settings, llm: { ...settings.llm, timeoutMs: Number(event.target.value) } })}
        />
      </Stack>
      <TextField
        label={t.options.settings.promptTemplate}
        value={settings.llm.promptTemplate}
        onChange={(event) => setSettings({ ...settings, llm: { ...settings.llm, promptTemplate: event.target.value } })}
        multiline
        minRows={12}
        helperText={t.options.settings.promptTemplateHelp}
      />

      <Typography variant="h6">{t.options.settings.pronunciation}</Typography>
      <TextField
        label={t.options.settings.merriamWebsterApiKey}
        type="password"
        value={settings.pronunciation.merriamWebsterApiKey}
        onChange={(event) =>
          setSettings({
            ...settings,
            pronunciation: { ...settings.pronunciation, merriamWebsterApiKey: event.target.value }
          })
        }
      />

      <Typography variant="h6">{t.options.settings.preferences}</Typography>
      <FormControlLabel
        control={<Checkbox checked={globalEnabled} onChange={(event) => setGlobalEnabled(event.target.checked)} />}
        label={t.options.settings.enableExtensionGlobally}
      />
      <TextField
        select
        label={t.options.settings.defaultHighlightColor}
        value={settings.ui.defaultHighlightColor}
        onChange={(event) =>
          setSettings({
            ...settings,
            ui: { ...settings.ui, defaultHighlightColor: event.target.value as AppSettings["ui"]["defaultHighlightColor"] }
          })
        }
      >
        {["yellow", "green", "blue", "pink", "purple"].map((color) => (
          <MenuItem key={color} value={color}>
            {color}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label={t.options.settings.disabledSites}
        value={disabledSitesText}
        onChange={(event) => setDisabledSitesText(event.target.value)}
        multiline
        minRows={4}
        helperText={t.options.settings.disabledSitesHelp}
      />
      <Button variant="contained" onClick={saveSettings}>
        {t.options.actions.saveSettings}
      </Button>

      <Typography variant="h6">{t.options.settings.importExport}</Typography>
      <FormControlLabel
        control={<Checkbox checked={includeSensitive} onChange={(event) => setIncludeSensitive(event.target.checked)} />}
        label={t.options.settings.includeSensitiveConfig}
      />
      <Stack direction="row" spacing={1} flexWrap="wrap">
        <Button
          startIcon={<Download size={16} />}
          onClick={() =>
            download(
              "remarker-backup.json",
              createBackupJson({
                settings: data.settings,
                highlights: data.highlights,
                vocabulary: data.vocabulary,
                explanations: data.explanations,
                includeSensitive
              }),
              "application/json"
            )
          }
        >
          {t.options.actions.exportJson}
        </Button>
        <Button
          startIcon={<FileText size={16} />}
          onClick={() =>
            download(
              "remarker-notes.md",
              createMarkdownExport({ highlights: data.highlights, vocabulary: data.vocabulary }),
              "text/markdown"
            )
          }
        >
          {t.options.actions.exportMarkdown}
        </Button>
        <Button startIcon={<Upload size={16} />} component="label">
          {t.options.actions.importJson}
          <input
            hidden
            type="file"
            accept="application/json"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void importJson(file);
              event.currentTarget.value = "";
            }}
          />
        </Button>
      </Stack>
    </Stack>
  );
}

function sortByCreatedAtDesc<T extends { createdAt: string }>(items: T[]): T[] {
  return [...items].sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
}

function formatCreatedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function getHighlightStatusDescription(status: HighlightStatus, t: Messages): string {
  switch (status) {
    case "active":
      return t.options.statusDescriptions.active;
    case "not_found":
      return t.options.statusDescriptions.not_found;
    case "ambiguous":
      return t.options.statusDescriptions.ambiguous;
    case "pending":
      return t.options.statusDescriptions.pending;
  }
}

function renderHighlightedContext(context: string, word: string): ReactNode {
  const target = word.trim();
  if (!target) return context;

  const lowerContext = context.toLowerCase();
  const lowerTarget = target.toLowerCase();
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let matchIndex = lowerContext.indexOf(lowerTarget);

  while (matchIndex !== -1) {
    const matchEnd = matchIndex + target.length;
    const isBoundaryMatch = isWordBoundary(context[matchIndex - 1]) && isWordBoundary(context[matchEnd]);

    if (isBoundaryMatch) {
      if (matchIndex > cursor) nodes.push(context.slice(cursor, matchIndex));
      nodes.push(
        <Box
          key={`${matchIndex}-${matchEnd}`}
          component="mark"
          sx={{
            bgcolor: "#ffe66d",
            borderRadius: "3px",
            px: "2px",
            color: "inherit"
          }}
        >
          {context.slice(matchIndex, matchEnd)}
        </Box>
      );
      cursor = matchEnd;
    }

    matchIndex = lowerContext.indexOf(lowerTarget, Math.max(matchIndex + 1, matchEnd));
  }

  if (nodes.length === 0) return context;
  if (cursor < context.length) nodes.push(context.slice(cursor));
  return nodes;
}

function isWordBoundary(char: string | undefined): boolean {
  return !char || !/[A-Za-z0-9]/.test(char);
}

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function createExplanationsMarkdownExport(explanations: ExplanationRecord[], t: Messages): string {
  const lines = [`# ${t.options.export.explanationsTitle}`, "", `${t.options.export.exported}: ${new Date().toISOString()}`, ""];

  for (const item of explanations) {
    lines.push(`## ${formatMarkdownHeading(item.selectedText, t.options.export.untitled)}`, "");
    lines.push(`- ${t.common.created}: ${item.createdAt}`);
    lines.push(`- ${t.options.export.source}: ${item.sourceUrl}`);
    lines.push(`- ${t.options.export.model}: ${item.model}`, "");
    lines.push(item.result.trim(), "");
  }

  return lines.join("\n");
}

function formatMarkdownHeading(value: string, fallback: string): string {
  return value.replace(/\s+/g, " ").replace(/^#+\s*/, "").trim() || fallback;
}

async function speakWord(word: string): Promise<void> {
  const response = await sendMessage<PronunciationResult>({
    type: "GET_PRONUNCIATION",
    word
  });

  if (response.audioUrl) {
    await new Audio(response.audioUrl).play();
    return;
  }

  speechSynthesis.cancel();
  speechSynthesis.speak(new SpeechSynthesisUtterance(word));
}

function sendMessage<T>(message: RuntimeMessage): Promise<T> {
  return chrome.runtime.sendMessage(message).then((response: { ok: boolean; result?: T; error?: string }) => {
    if (!response?.ok) throw new Error(response?.error ?? "Extension request failed.");
    return response.result as T;
  });
}
