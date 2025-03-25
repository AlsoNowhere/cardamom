import { MintEvent, Resolver, Store } from "mint";

import { saveToFile } from "../logic/save-to-file.logic";

import { listStore } from "./list.store";

class ControlsStore extends Store {
  hasFileLoaded: Resolver<boolean>;
  filePathName: Resolver<string>;
  doNothing: MintEvent;
  updateFileName: MintEvent<HTMLInputElement>;
  openFile: () => void;
  saveToFile: () => void;

  constructor() {
    super({
      hasFileLoaded: new Resolver(() => listStore.filePathName !== null),

      filePathName: new Resolver(() =>
        listStore.filePathName.split("\\").pop().split(".").shift()
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
    });
  }
}

export const controlsStore = new ControlsStore();
