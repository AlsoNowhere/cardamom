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

  window.addEventListener("loadFromFile", (event) => {
    // ** Define the event that will run once a file has been selected.
    ipcRenderer.once("actionReply", (_, response) => {
      if (response === undefined || response.content === undefined) {
        const [mainElement] = document.getElementsByTagName("MAIN");
        toast("Could not load file content", "tomato", mainElement);
        return;
      }
      const { content, filePathName } = response;
      window.dispatchEvent(new CustomEvent("fileLoaded", { detail: { content, filePathName } }));
    });

    // ** Trigger the file load on main process.
    ipcRenderer.send("loadFile", event.detail?.defaultPath);
  });

  // ** This function loads the content of a file named directly instead of
  // ** doing a user lookup.
  window.addEventListener("getFromFile", (event) => {
    // ** Define the event that will run once a file has been selected.
    ipcRenderer.once("getFileReply", (_, response) => {
      if (response === undefined || response.content === undefined) {
        const [mainElement] = document.getElementsByTagName("MAIN");
        toast("Could not load file content", "tomato", mainElement);
        return;
      }
      const { content } = response;
      window.dispatchEvent(new CustomEvent("getFileLoaded", { detail: { content } }));
    });

    // ** Trigger the file load on main process.
    ipcRenderer.send("getFileContents", event.detail.filePathName);
  });

  window.addEventListener("saveToFile", (event) => {
    ipcRenderer.send("saveFile", { ...event.detail });
  });
});

// ** This function connects the 'main.js' detection of looking up a file from explorer
// ** with the app.
ipcRenderer.on("appInitiateMain", (_, data) => {
  window.dispatchEvent(new CustomEvent("appInitiatePreload", { detail: data }));
});
