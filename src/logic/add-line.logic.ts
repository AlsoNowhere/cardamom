import { refresh } from "mint";

import { mainStore } from "../stores/main.store";

import { Line } from "../models/Line.model";

export const addLine = function () {
  mainStore.lines.splice(this.index + 1, 0, new Line());
  refresh(mainStore);
};
