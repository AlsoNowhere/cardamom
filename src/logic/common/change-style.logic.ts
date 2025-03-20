import { refresh } from "mint";

import { listStore } from "../../stores/list.store";

export const changeStyle = (style: string, value: string, toggle = false) => {
  const { currentIndex, lines, listElementRef } = listStore;

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

  refresh(listStore);

  listElementRef.children[currentIndex].querySelector("input").focus();
};
