import { refresh } from "mint";

import { saveData } from "./save.logic";

import { mainStore } from "../stores/main.store";

import { variables } from "../data/variables.data";

export const fontUp = () => {
  variables.fontSize += 2;
  saveData();
  refresh(mainStore);
};
