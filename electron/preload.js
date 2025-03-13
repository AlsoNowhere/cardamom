const { ipcRenderer } = require("electron");
const { toast } = require("sage/dist/sage-cjs");

window.addEventListener("DOMContentLoaded", () => {
  const selection = document.body.querySelector("aside").children;
  const [, minimiseButton, closeButton] = selection;

  minimiseButton.addEventListener("click", () => {
    ipcRenderer.send("minimize");
  });

  closeButton.addEventListener("click", () => {
    ipcRenderer.send("close");
  });

  window.addEventListener("loadFromFile", () => {
    ipcRenderer.once("actionReply", function (_, response) {
      if (response === undefined || response.content === undefined) {
        const [mainElement] = document.getElementsByTagName("MAIN");
        toast("Could not load file content", "tomato", mainElement);
        return;
      }
      const { content, filePathName } = response;
      window.dispatchEvent(
        new CustomEvent("fileLoaded", { detail: { content, filePathName } })
      );
    });
    ipcRenderer.send("loadFile");
  });

  window.addEventListener("saveToFile", (event) => {
    ipcRenderer.send("saveFile", { ...event.detail });
  });
});
