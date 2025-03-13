import { refresh } from "mint";

import {
  resolveColours,
  resolveLine3,
  resovleLoadContent,
} from "./resolve-content.logic";

import { mainStore } from "../stores/main.store";

export const loadFile = (content: string, filePathName: string) => {
  mainStore.filePathName = filePathName;

  // console.log(content);

  // ** Parsed the rich text file
  const contentLines = content.split("\n");

  const index = contentLines.findIndex((x) => x.includes("\\pard"));

  mainStore.colours = {};
  resolveColours(contentLines.find((x) => x.includes("\\colortbl")));

  // ** On line 3 we find settings but also the beginning of the content.
  // ** We want only the user content, which can be found after the first space
  let line3 = contentLines[index].substring(
    0,
    contentLines[index].indexOf(" ")
  );
  if (!contentLines[index].includes(" ")) {
    // ** If there is no content (empty file) then make sure we take the whole line.
    line3 = contentLines[index];
  }

  line3 = resolveLine3(line3);

  // ** Save the content for later; when we put it back together to save the file.
  mainStore.contentFromFile = [...contentLines.slice(0, index), line3];

  const lines: Array<string> = [];

  // ** Check if the content is empty.
  if (contentLines[index].includes(" ")) {
    lines.push(
      contentLines[index].substring(contentLines[index].indexOf(" ") + 1)
    );
  } else {
    lines.push("");
  }

  {
    // ** Extract the content lines.
    let i = index + 1;
    while (i < contentLines.length - 2) {
      const line = contentLines[i];
      lines.push(line);
      i++;
    }
  }

  mainStore.lines = resovleLoadContent(lines);

  refresh(mainStore);
};
