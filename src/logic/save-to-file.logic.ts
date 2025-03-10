import { mainStore } from "../stores/main.store";

export const saveToFile = () => {
  const appContent = mainStore.lines
    .map(({ content }) => {
      if (content === "") return content;
      return `${content}\\par`;
    })
    .join("\n");

  const line1 = mainStore.contentFromFile["1"] + "\n";
  const line2 = mainStore.contentFromFile["2"] + "\n";
  let line3 = mainStore.contentFromFile["3"];
  const line4 = mainStore.contentFromFile["4"] + "\n";
  const line5 = mainStore.contentFromFile["5"];

  if (line3.substring(line3.length - 5) === "\\par\r") {
    line3 = line3.substring(0, line3.length - 5);
  }

  let contentLine = line3 + " " + appContent + "\n";
  if (appContent === "") {
    contentLine = line3 + "\n";
  }

  const content = line1 + line2 + contentLine + line4 + line5;

  const saveToFile = new CustomEvent("saveToFile", {
    detail: { content, filePathName: mainStore.filePathName },
  });
  window.dispatchEvent(saveToFile);
};
