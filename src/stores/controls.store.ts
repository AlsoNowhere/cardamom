import { MintEvent, refresh, Resolver, Store } from "mint";

import { saveToFile } from "../logic/save-to-file.logic";

import { listStore } from "./list.store";
import { appStore } from "./app.store";

class ControlsStore extends Store {
  hasFileLoaded: Resolver<boolean>;
  fileName: Resolver<string>;
  fileLocation: Resolver<string>;
  isTextareaTheme: Resolver<string>;
  doNothing: MintEvent;
  updateFileName: MintEvent<HTMLInputElement>;
  openFile: () => void;
  saveToFile: () => void;
  toggleTextarea: () => void;

  constructor() {
    super({
      hasFileLoaded: new Resolver(() => listStore.filePathName !== null),

      fileName: new Resolver(() =>
        listStore.filePathName.split("\\").pop().split(".").shift()
      ),

      fileLocation: new Resolver(() =>
        listStore.filePathName.split("\\").slice(0, -1).join("\\")
      ),

      isTextareaTheme: new Resolver(() =>
        appStore.isTextarea ? "blueberry" : "snow"
      ),

      doNothing: (event) => event.preventDefault(),

      updateFileName: (_, element) => {
        const filePath = listStore.filePathName
          .split("\\")
          .slice(0, -1)
          .join("\\");
        const newValue = filePath + "\\" + element.value + ".rtf";
        listStore.filePathName = newValue;
      },

      openFile: () => {
        window.dispatchEvent(new Event("loadFromFile"));
      },

      saveToFile: () => {
        saveToFile();
      },

      toggleTextarea() {
        appStore.isTextarea = !appStore.isTextarea;
        refresh(appStore);
      },
    });
  }
}

export const controlsStore = new ControlsStore();
