import { app, node } from "mint";

import { wait } from "sage";

import { App } from "./components/App.component";

import { loadFile } from "./logic/load-file.logic";

// ** The following events define the functions that enable opening a file
// ** in Cardamom directly from the file explorer.
{
  // ** The file name and path of the file we're trying to access directly in
  // ** explorer and open in Cardamom.
  // ** This will only exists once per app so we can put it out here.
  let filePathName;

  // ** This event is called from 'preload.js' when the content has been loaded.
  window.addEventListener("getFileLoaded", (event: CustomEvent) => {
    loadFile(event.detail.content, filePathName);
  });

  // ** This event runs when a file has been loaded from file explorer which
  // ** is detected in 'main.js'.
  window.addEventListener("appInitiatePreload", async (event: CustomEvent) => {
    // ** Get the file name and path.
    const { detail } = event;
    if (detail.files[1] === ".") return;
    filePathName = detail.files.at(-1);

    // ** Wait for the rest of the Mint app to load.
    await wait(1000);

    // ** Send to the Node process to get the file content.
    const newEvent = new CustomEvent("getFromFile", {
      detail: {
        filePathName,
      },
    });
    window.dispatchEvent(newEvent);
  });
}

app(document.body, {}, node(App));
