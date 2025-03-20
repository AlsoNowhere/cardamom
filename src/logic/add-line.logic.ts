import { refresh } from "mint";

import { listStore } from "../stores/list.store";

import { Line } from "../models/Line.model";

export const addLine = function () {
  listStore.lines.splice(this.index + 1, 0, new Line());
  refresh(listStore);
};
