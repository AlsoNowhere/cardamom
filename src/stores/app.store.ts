import { refresh, Resolver, Store } from "mint";

import { wait } from "sage";

import { addKeyEvents } from "../logic/add-key-events.logic";
import { addLoadFileEvent } from "../logic/add-load-file-event.logic";
import { loadLocal } from "../logic/load-save-local.logic";

import { listStore } from "./list.store";
import { controlsStore } from "./controls.store";

import { OpenFile } from "../models/OpenFile.model";
import { QuickLoad } from "../models/QuickLoad.model";

class AppStore extends Store {
  isTextarea: boolean;
  isSearchOpen: boolean;
  mainListElementRef: HTMLDivElement;
  openFiles: Array<OpenFile>;
  currentFileIndex: number;
  quickLoadModalState: string;
  quickLoadTargets: Array<QuickLoad>;

  textareaContent: Resolver<string>;
  isTextareaOverflow: Resolver<string>;
  currentTabClass: Resolver<string>;

  constructor() {
    super({
      isTextarea: false,
      isSearchOpen: false,
      mainListElementRef: null,
      openFiles: [],
      currentFileIndex: -1,
      quickLoadTargets: [],

      textareaContent: new Resolver(() => {
        return listStore.lines.map((x) => x.content).join("\n");
      }),
      isTextareaOverflow: new Resolver(() => (appStore.isTextarea ? "hidden" : "auto")),
      currentTabClass: new Resolver(function () {
        return this._i === appStore.currentFileIndex ? "blueberry-bg snow-text" : "";
      }),

      oninit: async () => {
        loadLocal();

        await wait();
        refresh(controlsStore);

        addKeyEvents();
        addLoadFileEvent();
      },
    });
  }
}

export const appStore = new AppStore();
