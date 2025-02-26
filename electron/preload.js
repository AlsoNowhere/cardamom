const { ipcRenderer } = require("electron");

window.addEventListener("DOMContentLoaded", () => {
  const selection = document.body.querySelector("header div").children;
  const [minimiseButton, closeButton] = selection;

  minimiseButton.addEventListener("click", () => {
    ipcRenderer.send("minimize");
  });

  closeButton.addEventListener("click", () => {
    ipcRenderer.send("close");
  });
});
