import { refresh } from "mint";

import { resolveColours } from "./resolve-content.logic";
import { resovleLoadContent } from "./load/resolve-load.logic";

import { listStore } from "../stores/list.store";
import { appStore } from "../stores/app.store";

import { OpenFile } from "../models/OpenFile.model";
import { selectTab } from "./select-tab.logic";

export const loadFile = (content: string, filePathName: string) => {
  listStore.contentFromFile = content.substring(0, content.indexOf("\\par")).split("\n");

  let resolvedContent = "";
  {
    const mainContent = content.substring(content.indexOf("\\par"), content.length - 1).split("");

    for (let [index, char] of mainContent.entries()) {
      if ((char === "{" || char === "}") && mainContent[index - 1] !== "\\") {
        continue;
      }

      resolvedContent += char;
    }
  }

  const contentLines = resolvedContent.split("\n");

  // ** Set the colours for this file.
  const colourLine = contentLines.find((x) => x.includes("\\colortbl"));

  const colours = resolveColours(colourLine);

  const lines = resovleLoadContent(contentLines, colours);

  const openFile = new OpenFile(filePathName, lines, colours);

  appStore.openFiles.push(openFile);
  selectTab(appStore.openFiles.length - 1);

  // refresh(appStore);
};
