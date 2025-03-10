import { loadFile } from "./load-file.logic";

export const addLoadFileEvent = () => {
  window.addEventListener("fileLoaded", (event: CustomEvent) => {
    const {
      detail: { content, filePathName },
    } = event;
    loadFile(content, filePathName);
  });
};
