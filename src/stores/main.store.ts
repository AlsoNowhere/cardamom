import { MintEvent, refresh, Store } from "mint";

import { wait } from "sage";

import { addKeyEvents } from "../logic/add-key-events.logic";
import { addLoadFileEvent } from "../logic/add-load-file-event.logic";

import { Line } from "../models/Line.model";

class MainStore extends Store {
  filePathName: string;
  contentFromFile: {
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
  };
  lines: Array<Line>;
  currentIndex: number;
  listElementRef: HTMLUListElement;

  doNothing: MintEvent<HTMLFormElement>;

  constructor() {
    super({
      filePathName: null,
      contentFromFile: null,
      lines: [],
      currentIndex: null,
      listElementRef: null,

      oninit: async () => {
        addKeyEvents();
        addLoadFileEvent();

        await wait();

        refresh(mainStore);
      },

      doNothing(event) {
        event.preventDefault();
      },
    });
  }
}

export const mainStore = new MainStore();
