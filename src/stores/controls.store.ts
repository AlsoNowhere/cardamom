import { MintEvent, refresh, Resolver, Store } from "mint";

import { wait } from "sage";

import { saveToFile } from "../logic/save-to-file.logic";

import { listStore } from "./list.store";
import { appStore } from "./app.store";
import { modalsStore } from "./modals.store";

import { QuickLoad } from "../models/QuickLoad.model";

class ControlsStore extends Store {
  hasFileLoaded: Resolver<boolean>;
  fileName: Resolver<string>;
  fileLocation: Resolver<string>;
  isTextareaTheme: Resolver<string>;
  quickLoadTargets: Resolver<Array<QuickLoad>>;
  getQuickLoadIndex: Resolver<number>;

  doNothing: MintEvent;
  updateFileName: MintEvent<HTMLInputElement>;
  openFile: (defaultPath?: string) => void;
  saveToFile: () => void;
  toggleTextarea: () => void;

  constructor() {
    super({
      hasFileLoaded: new Resolver(() => listStore.filePathName !== null),

      fileName: new Resolver(() => listStore.filePathName.split("\\").pop().split(".").shift()),

      fileLocation: new Resolver(() => listStore.filePathName.split("\\").slice(0, -1).join("\\")),

      isTextareaTheme: new Resolver(() => (appStore.isTextarea ? "blueberry" : "snow")),

      quickLoadTargets: new Resolver(() => {
        return appStore.quickLoadTargets;
      }),

      getQuickLoadIndex: new Resolver(function () {
        return this._i + 1;
      }),

      doNothing: (event) => event.preventDefault(),

      updateFileName: (_, element) => {
        const filePath = listStore.filePathName.split("\\").slice(0, -1).join("\\");
        const newValue = filePath + "\\" + element.value + ".rtf";
        listStore.filePathName = newValue;
      },

      openFile: (defaultPath?: string) => {
        const event = new CustomEvent("loadFromFile", {
          detail: {
            defaultPath,
          },
        });
        window.dispatchEvent(event);
      },

      saveToFile: () => {
        saveToFile();
      },

      toggleTextarea() {
        appStore.isTextarea = !appStore.isTextarea;
        refresh(appStore);
      },

      openSearch: async function () {
        if (appStore.isSearchOpen) return;
        appStore.isSearchOpen = true;
        refresh(appStore);
        await wait();
        document["search-form"]?.searchValue?.focus();
      },

      openQuickLoad() {
        modalsStore.quickLoadModalState = "open";
        refresh(modalsStore);
      },

      openFromFolder() {
        controlsStore.openFile(this.folderPath);
      },
    });
  }
}

export const controlsStore = new ControlsStore();
