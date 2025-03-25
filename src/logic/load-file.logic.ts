import { refresh } from "mint";

import { resolveColours, resolvefirstContent } from "./resolve-content.logic";
import { resovleLoadContent } from "./load/resolve-load.logic";

import { listStore } from "../stores/list.store";
import { appStore } from "../stores/app.store";

const getContent = (contentLines: Array<string>) => {
  // ** The first line of content will be the first line to have "\par in".
  // const firstContentLineIndex = contentLines.findIndex((x) =>
  //   x.includes("\\par")
  // );
  // ** This means the lines from the start until here are non content lines.
  // const contentLinesBeforeContent = contentLines.slice(
  //   0,
  //   firstContentLineIndex
  // );

  const firstContentLine = contentLines.find((x) => x.includes("\\par"));
  const contentIndex = contentLines.indexOf(firstContentLine);
  const linesBeforeContent = contentLines.slice(0, contentIndex);

  // const firstLineWithContent = contentLines[firstContentLineIndex];
  let preContent = "";
  // let openingContent = "";
  let firstContent = "";

  const index = firstContentLine.includes("{")
    ? firstContentLine.lastIndexOf("}") + 1
    : 0;
  const { length } = firstContentLine;
  preContent += firstContentLine.substring(0, index);
  firstContent = firstContentLine.substring(index, length);

  {
    const [firstMatch] = [...firstContent.matchAll(/\s[^\\]/g)];
    if (firstMatch === undefined) {
      firstContent = "";
    } else {
      const { index } = firstMatch;
      const { length } = firstContent;
      preContent += firstContent.substring(0, index);
      firstContent = firstContent.substring(index + 1, length);
    }
  }

  // if (firstLineWithContentNonContent.charAt(0) === "{") {
  //   const index = firstLineWithContentNonContent.indexOf("}") + 1;
  //   openingContent = firstLineWithContentNonContent.substring(0, index);
  //   firstLineWithContentNonContent = firstLineWithContentNonContent.substring(
  //     index,
  //     firstLineWithContentNonContent.length
  //   );
  // }
  // if (firstLineWithContentNonContent.includes(" ")) {
  //   const index = firstLineWithContentNonContent.indexOf(" ");
  //   firstContent = firstLineWithContentNonContent.substring(
  //     index + 1,
  //     firstLineWithContentNonContent.length
  //   );
  //   firstLineWithContentNonContent = firstLineWithContentNonContent.substring(
  //     0,
  //     index
  //   );
  // }
  // firstLineWithContentNonContent =
  //   openingContent + firstLineWithContentNonContent;

  return {
    linesBeforeContent,
    firstContentLine,
    contentIndex,
    // firstContentLineIndex,
    // contentLinesBeforeContent,
    // firstLineWithContentNonContent,
    preContent,
    firstContent,
  };
};

export const loadFile = (content: string, filePathName: string) => {
  // ** Set the file name on the store so we have it for later (when saving or editing).
  listStore.filePathName = filePathName;

  console.log(content);

  // ** Parsed the rich text file
  const contentLines = content.split("\n");

  const {
    // firstContentLine,
    linesBeforeContent,
    contentIndex,
    // firstContentLineIndex,
    // contentLinesBeforeContent,
    // firstLineWithContentNonContent,
    // firstLineOfContent,
    preContent,
    firstContent,
  } = getContent(contentLines);

  // ** Set the colours for this file.
  const colourLine = linesBeforeContent.find((x) => x.includes("\\colortbl"));
  listStore.colours = resolveColours(colourLine);

  // ** Here we resolve certain aspects of the styling of the file
  // ** such as font size and line height.
  const managedPreContent = resolvefirstContent(preContent);
  // ** Save the content for later; when we put it back together to save the file.
  listStore.contentFromFile = [...linesBeforeContent, managedPreContent];

  const lines: Array<string> = [];

  // ** Check if the content is empty.
  lines.push(firstContent);
  // if (firstContent !== "") {
  //   lines.push(firstContent.substring(firstContent.indexOf(" ") + 1));
  // }
  // // ** We need to have at least one line, even if its an empty string.
  // else {
  //   lines.push("");
  // }

  {
    // ** Extract the content lines.
    let i = contentIndex + 1;
    while (i < contentLines.length - 2) {
      const line = contentLines[i];
      lines.push(line);
      i++;
    }
  }

  console.log("Bag: ", lines, firstContent, contentIndex);

  listStore.lines = resovleLoadContent(lines);

  refresh(appStore);
};
