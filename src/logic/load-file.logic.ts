import { refresh } from "mint";

import { resolveColours, resolvefirstContent } from "./resolve-content.logic";
import { resovleLoadContent } from "./load/resolve-load.logic";

import { listStore } from "../stores/list.store";

const getContent = (contentLines: Array<string>) => {
  // ** The first line of content will be the first line to have "\par in".
  const firstContentLineIndex = contentLines.findIndex((x) =>
    x.includes("\\par")
  );
  // ** This means the lines from the start until here are non content lines.
  const contentLinesBeforeContent = contentLines.slice(
    0,
    firstContentLineIndex
  );

  const firstLineWithContent = contentLines[firstContentLineIndex];
  let beforeContent = "";
  // let openingContent = "";
  let firstContent = "";

  if (firstLineWithContent.includes("{")) {
    const index = firstLineWithContent.lastIndexOf("}") + 1;
    beforeContent += firstLineWithContent.substring(0, index);
    firstContent = firstLineWithContent.substring(
      index,
      firstLineWithContent.length
    );
  }

  {
    const [firstMatch] = [...firstContent.matchAll(/\s[^\\]/g)];
    beforeContent += firstContent.substring(0, firstMatch.index);
    firstContent = firstContent.substring(
      firstMatch.index + 1,
      firstContent.length
    );
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
    firstContentLineIndex,
    contentLinesBeforeContent,
    // firstLineWithContentNonContent,
    beforeContent,
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
    firstContentLineIndex,
    contentLinesBeforeContent,
    // firstLineWithContentNonContent,
    // firstLineOfContent,
    beforeContent,
    firstContent,
  } = getContent(contentLines);

  // ** Set the colours for this file.
  const colourLine = contentLinesBeforeContent.find((x) =>
    x.includes("\\colortbl")
  );
  listStore.colours = resolveColours(colourLine);

  // ** Save the content for later; when we put it back together to save the file.
  listStore.contentFromFile = [
    ...contentLinesBeforeContent,
    resolvefirstContent(beforeContent),
  ];

  const lines: Array<string> = [];

  // ** Check if the content is empty.
  if (firstContent !== "") {
    lines.push(firstContent.substring(firstContent.indexOf(" ") + 1));
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

  listStore.lines = resovleLoadContent(lines);

  refresh(listStore);
};
