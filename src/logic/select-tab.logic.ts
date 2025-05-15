import { refresh } from "mint";

import { appStore } from "../stores/app.store";
import { listStore } from "../stores/list.store";

import { defaultFontSize } from "../data/constants.data";

export const selectTab = (index: number) => {
  appStore.currentFileIndex = index;

  if (index === -1) {
    listStore.filePathName = "";
    listStore.lines = [];
    listStore.colours = [];
    listStore.fontSize = defaultFontSize;
  } else {
    const openFile = appStore.openFiles[index];

    listStore.filePathName = openFile.filePathName;
    listStore.lines = openFile.lines;
    listStore.colours = openFile.colours;
    listStore.fontSize = openFile.fontSize;
  }

  refresh(appStore);
};
