import { refresh, Store } from "mint";

import { wait } from "sage";

import { addKeyEvents } from "../logic/add-key-events.logic";
import { addLoadFileEvent } from "../logic/add-load-file-event.logic";

import { listStore } from "./list.store";

class AppStore extends Store {
  constructor() {
    super({
      oninit: async () => {
        addKeyEvents();
        addLoadFileEvent();

        await wait();

        refresh(listStore);
      },
    });
  }
}

export const appStore = new AppStore();
