import { refresh } from "mint";

import { mainStore } from "../stores/main.store";

export const deleteLine = function () {
  if (mainStore.lines.length === 1) return;
  mainStore.lines.splice(this.index, 1);
  refresh(mainStore);
};
