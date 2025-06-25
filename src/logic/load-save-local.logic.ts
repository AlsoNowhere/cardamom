import { appStore } from "../stores/app.store";

import { QuickLoad } from "../models/QuickLoad.model";

import { storageKey } from "../data/constants.data";

export const loadLocal = () => {
  const data = localStorage.getItem(storageKey) ?? `{ "quickLoad": [] }`;
  const parsed = JSON.parse(data) as { quickLoad: Array<QuickLoad> };
  const { quickLoad } = parsed;
  const items = quickLoad.map((x) => new QuickLoad(x.folderPath));
  appStore.quickLoadTargets = items;
};

export const saveLocal = () => {
  const data = { quickLoad: appStore.quickLoadTargets };
  localStorage.setItem(storageKey, JSON.stringify(data));
};
