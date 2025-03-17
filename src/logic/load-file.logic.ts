import { refresh } from "mint";

import { resolveColours, resolvefirstContent } from "./resolve-content.logic";
import { resovleLoadContent } from "./load/resolve-load.logic";

import { mainStore } from "../stores/main.store";

const getContent = (contentLines: Array<string>) => {
  const firstContentLineIndex = contentLines.findIndex((x) =>
    x.includes("\\pard")
  );
  const contentLinesBeforeContent = contentLines.slice(
    0,
    firstContentLineIndex
  );

  let firstLineWithContentNonContent = contentLines[firstContentLineIndex];
  let openingContent = "";
  let firstLineOfContent = "";
  if (firstLineWithContentNonContent.charAt(0) === "{") {
    const index = firstLineWithContentNonContent.indexOf("}") + 1;
    openingContent = firstLineWithContentNonContent.substring(0, index);
    firstLineWithContentNonContent = firstLineWithContentNonContent.substring(
      index,
      firstLineWithContentNonContent.length
    );
  }
  if (firstLineWithContentNonContent.includes(" ")) {
    const index = firstLineWithContentNonContent.indexOf(" ");
    firstLineOfContent = firstLineWithContentNonContent.substring(
      index + 1,
      firstLineWithContentNonContent.length
    );
    firstLineWithContentNonContent = firstLineWithContentNonContent.substring(
      0,
      index
    );
  }
  firstLineWithContentNonContent =
    openingContent + firstLineWithContentNonContent;

  return {
    firstContentLineIndex,
    contentLinesBeforeContent,
    firstLineWithContentNonContent,
    firstLineOfContent,
  };
};

export const loadFile = (content: string, filePathName: string) => {
  // ** Set the file name on the store so we have it for later (when saving or editing).
  mainStore.filePathName = filePathName;

  // console.log(content);

  // ** Parsed the rich text file
  const contentLines = content.split("\n");

  const {
    firstContentLineIndex,
    contentLinesBeforeContent,
    firstLineWithContentNonContent,
    firstLineOfContent,
  } = getContent(contentLines);

  // ** Set the colours for this file.
  const colourLine = contentLinesBeforeContent.find((x) =>
    x.includes("\\colortbl")
  );
  mainStore.colours = resolveColours(colourLine);

  // ** Save the content for later; when we put it back together to save the file.
  mainStore.contentFromFile = [
    ...contentLinesBeforeContent,
    resolvefirstContent(firstLineWithContentNonContent),
  ];

  const lines: Array<string> = [];

  // ** Check if the content is empty.
  if (firstLineOfContent !== "") {
    lines.push(
      firstLineOfContent.substring(firstLineOfContent.indexOf(" ") + 1)
    );
  }
  // ** We need to have at least one line, even if its an empty string.
  else {
    lines.push("");
  }

  {
    // ** Extract the content lines.
    let i = firstContentLineIndex + 1;
    while (i < contentLines.length - 2) {
      const line = contentLines[i];
      lines.push(line);
      i++;
    }
  }

  mainStore.lines = resovleLoadContent(lines);

  refresh(mainStore);
};
