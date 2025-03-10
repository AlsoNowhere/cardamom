import { refresh } from "mint";

import { resovleContent } from "./resolve-content.logic";

import { mainStore } from "../stores/main.store";

import { Line } from "../models/Line.model";

export const loadFile = (content: string, filePathName: string) => {
  mainStore.filePathName = filePathName;

  const contentLines = content.split("\n");

  let line3 = contentLines[2].substring(0, contentLines[2].indexOf(" "));
  if (!contentLines[2].includes(" ")) {
    line3 = contentLines[2];
  }

  mainStore.contentFromFile = {
    1: contentLines[0],
    2: contentLines[1],
    3: line3,
    4: contentLines[contentLines.length - 2],
    5: contentLines[contentLines.length - 1],
  };

  const lines: Array<string> = [];

  if (contentLines[2].includes(" ")) {
    lines.push(contentLines[2].substring(contentLines[2].indexOf(" ") + 1));
  } else {
    lines.push("");
  }

  {
    let i = 3;
    while (i < contentLines.length - 2) {
      const line = contentLines[i];
      lines.push(line);
      i++;
    }
  }

  mainStore.lines = lines.map((x) => new Line({ content: resovleContent(x) }));

  refresh(mainStore);
};
