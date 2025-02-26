import { MintEvent } from "mint";

import { saveData } from "./save.logic";

import { textStore } from "../stores/text.store";

export const insertText: MintEvent = () => {
  const element = textStore.textElementRef.ref;

  textStore.content = element.innerHTML;

  saveData();
};
