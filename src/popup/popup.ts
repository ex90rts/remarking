import "./popup.css";
import { detectBrowserLanguage, getMessages } from "../shared/i18n";
import type { Messages, SupportedLanguage } from "../shared/i18n";

const globalEnabledInput = document.querySelector<HTMLInputElement>("#globalEnabled");
const siteEnabledInput = document.querySelector<HTMLInputElement>("#siteEnabled");
const statusText = document.querySelector<HTMLElement>("#statusText");
const openOptionsButton = document.querySelector<HTMLButtonElement>("#openOptions");
const globalEnabledLabel = document.querySelector<HTMLElement>("#globalEnabledLabel");
const siteEnabledLabel = document.querySelector<HTMLElement>("#siteEnabledLabel");

let currentHostname = "";
let t: Messages = getMessages(detectBrowserLanguage());

init().catch((error) => {
  if (statusText) statusText.textContent = error instanceof Error ? error.message : t.popup.failed;
});

async function init(): Promise<void> {
  await loadMessages();
  applyMessages();

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentHostname = tab.url ? new URL(tab.url).hostname.toLowerCase() : "";

  const cache = await chrome.storage.local.get(["globalEnabled", "disabledSites"]);
  const globalEnabled = cache.globalEnabled ?? true;
  const disabledSites = Array.isArray(cache.disabledSites) ? cache.disabledSites : [];

  if (globalEnabledInput) globalEnabledInput.checked = globalEnabled;
  if (siteEnabledInput) siteEnabledInput.checked = currentHostname ? !disabledSites.includes(currentHostname) : false;
  if (statusText) statusText.textContent = currentHostname || t.popup.noSite;

  globalEnabledInput?.addEventListener("change", async () => {
    await chrome.storage.local.set({ globalEnabled: Boolean(globalEnabledInput.checked) });
  });

  siteEnabledInput?.addEventListener("change", async () => {
    const next = new Set<string>(disabledSites);
    if (siteEnabledInput.checked) next.delete(currentHostname);
    else next.add(currentHostname);
    await chrome.storage.local.set({ disabledSites: Array.from(next) });
  });

  openOptionsButton?.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });
}

async function loadMessages(): Promise<void> {
  const settings = await chrome.runtime
    .sendMessage({ type: "GET_SETTINGS" })
    .then((response: { ok: boolean; result?: { ui?: { language?: SupportedLanguage } } }) => response.result)
    .catch(() => undefined);
  t = getMessages(settings?.ui?.language ?? detectBrowserLanguage());
}

function applyMessages(): void {
  if (statusText) statusText.textContent = t.popup.loading;
  if (globalEnabledLabel) globalEnabledLabel.textContent = t.popup.enableExtension;
  if (siteEnabledLabel) siteEnabledLabel.textContent = t.popup.enableCurrentSite;
  if (openOptionsButton) openOptionsButton.textContent = t.popup.openManagementPage;
}
