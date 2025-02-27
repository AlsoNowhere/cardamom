import { refresh } from "mint";
import { Line } from "../models/Line.model";
import { mainStore } from "../stores/main.store";
import { saveData } from "./save.logic";

export const addLine = function () {
  mainStore.lines.splice(this.index + 1, 0, new Line());
  saveData();
  refresh(mainStore);
};
