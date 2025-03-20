import { refresh } from "mint";

import { listStore } from "../stores/list.store";

import { variables } from "../data/variables.data";

export const fontUp = () => {
  variables.fontSize += 2;
  refresh(listStore);
};
