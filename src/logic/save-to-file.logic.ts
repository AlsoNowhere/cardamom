import { resolveSaveContent } from "./resolve-content.logic";

import { mainStore } from "../stores/main.store";

const endOfFileContent = "}\r" + "\n" + "\u0000";

const resolveFirstContentLine = (line: string, appContent: string) => {
  // ** Remove an unneeded line break that might be added.
  if (line.substring(line.length - 5) === "\\par\r") {
    line = line.substring(0, line.length - 5);
  }

  // ** If there is no appContent then we don't need to add a space in.
  line = appContent === "" ? line + "\n" : line + " " + appContent + "\n";

  return line;
};

export const saveToFile = () => {
  const { appContent, coloursLine } = resolveSaveContent(mainStore.lines);
  const hasFileColoursIndex = mainStore.contentFromFile.findIndex((x) =>
    x.includes("\\colortbl")
  );

  // ** File HAS colours AND colours ARE defined in app.
  if (hasFileColoursIndex !== -1 && coloursLine !== undefined) {
    mainStore.contentFromFile.splice(hasFileColoursIndex, 1, coloursLine);
  }
  // ** File DOES NOT HAVE colours AND colours ARE defined in app.
  else if (hasFileColoursIndex === -1 && coloursLine !== undefined) {
    mainStore.contentFromFile.splice(1, 0, coloursLine);
  }
  // ** File HAS colours AND colours ARE NOT defined in app.
  else if (hasFileColoursIndex !== -1 && coloursLine === undefined) {
    mainStore.contentFromFile.splice(hasFileColoursIndex, 1);
  }

  const contentLinesBeforeContent = mainStore.contentFromFile
    .slice(0, -1)
    .join("\n");

  const firstLineWithContent = resolveFirstContentLine(
    mainStore.contentFromFile.at(-1),
    appContent
  );

  const content =
    contentLinesBeforeContent + firstLineWithContent + endOfFileContent;

  // console.log(content);

  const saveToFile = new CustomEvent("saveToFile", {
    detail: { content, filePathName: mainStore.filePathName },
  });

  window.dispatchEvent(saveToFile);
};
