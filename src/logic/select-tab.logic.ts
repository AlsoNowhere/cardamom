import { refresh } from "mint";

import { appStore } from "../stores/app.store";
import { listStore } from "../stores/list.store";

export const selectTab = (index: number) => {
  appStore.currentFileIndex = index;

  if (index === -1) {
    listStore.filePathName = "";
    listStore.lines = [];
    listStore.colours = [];
  } else {
    const openFile = appStore.openFiles[index];

    listStore.filePathName = openFile.filePathName;
    listStore.lines = openFile.lines;
    listStore.colours = openFile.colours;
  }

  refresh(appStore);
};
