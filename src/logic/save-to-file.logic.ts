import { resolveSaveContent } from "./resolve-content.logic";

import { mainStore } from "../stores/main.store";

export const saveToFile = () => {
  const appContent = resolveSaveContent(mainStore.lines);

  const otherLines = mainStore.contentFromFile.join("\n");

  // const line1 = mainStore.contentFromFile["1"] + "\n";
  // const line2 = mainStore.contentFromFile["2"] + "\n";
  let line3 = mainStore.contentFromFile[-1];

  if (line3.substring(line3.length - 5) === "\\par\r") {
    line3 = line3.substring(0, line3.length - 5);
  }

  let contentLine = line3 + " " + appContent + "\n";
  if (appContent === "") {
    contentLine = line3 + "\n";
  }

  const content = otherLines + contentLine + "}\r" + "\n" + "\u0000";

  // console.log(content);

  const saveToFile = new CustomEvent("saveToFile", {
    detail: { content, filePathName: mainStore.filePathName },
  });
  window.dispatchEvent(saveToFile);
};
