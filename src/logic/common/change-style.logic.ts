import { refresh } from "mint";

import { listStore } from "../../stores/list.store";

export const changeStyle = (style: string, value: string, toggle = false) => {
  const { lastCurrentIndex, lines, listElementRef } = listStore;

  if (lastCurrentIndex === null) return;

  const { styles } = lines[lastCurrentIndex];

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

  listElementRef.children[lastCurrentIndex].querySelector("input").focus();
};
