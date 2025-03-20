import { refresh } from "mint";

import { listStore } from "../stores/list.store";

export const deleteLine = function () {
  if (listStore.lines.length === 1) return;
  listStore.lines.splice(this.index, 1);
  refresh(listStore);
};
