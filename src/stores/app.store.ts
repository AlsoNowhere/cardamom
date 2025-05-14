import { refresh, Resolver, Store } from "mint";

import { wait } from "sage";

import { addKeyEvents } from "../logic/add-key-events.logic";
import { addLoadFileEvent } from "../logic/add-load-file-event.logic";

import { listStore } from "./list.store";

import { OpenFile } from "../models/OpenFile.model";

class AppStore extends Store {
  isTextarea: boolean;
  isSearchOpen: boolean;
  mainListElementRef: HTMLDivElement;

  isTextareaOverflow: Resolver<string>;

  openFiles: Array<OpenFile>;
  currentFileIndex: number;
  currentTabClass: Resolver<string>;

  constructor() {
    super({
      isTextarea: false,
      isSearchOpen: false,
      mainListElementRef: null,

      isTextareaOverflow: new Resolver(() => (appStore.isTextarea ? "hidden" : "auto")),

      openFiles: [],
      currentFileIndex: -1,
      currentTabClass: new Resolver(function () {
        return this._i === appStore.currentFileIndex ? "blueberry-bg snow-text" : "";
      }),

      oninit: async () => {
        addKeyEvents();
        addLoadFileEvent();

        await wait();

        refresh(listStore);
      }
    });
  }
}

export const appStore = new AppStore();
