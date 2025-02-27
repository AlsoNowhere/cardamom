import { refresh } from "mint";

import { saveData } from "../save.logic";

import { mainStore } from "../../stores/main.store";

export const changeStyle = (style: string, value: string, toggle = false) => {
  const { currentIndex, lines, listElementRef } = mainStore;

  if (currentIndex === null) return;

  const { styles } = lines[currentIndex];

  if (toggle) {
    if (!!styles[style]) {
      delete styles[style];
    } else {
      styles[style] = value;
    }
  } else {
    styles[style] = value;
  }

  saveData();

  refresh(mainStore);

  listElementRef.children[currentIndex].querySelector("input").focus();
};
