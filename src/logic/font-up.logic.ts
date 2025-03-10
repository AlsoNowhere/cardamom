import { refresh } from "mint";

import { mainStore } from "../stores/main.store";

import { variables } from "../data/variables.data";

export const fontUp = () => {
  variables.fontSize += 2;
  refresh(mainStore);
};
