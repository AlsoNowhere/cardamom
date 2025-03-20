import { MintEvent, refresh, Store } from "mint";

import { wait } from "sage";

import { addKeyEvents } from "../logic/add-key-events.logic";
import { addLoadFileEvent } from "../logic/add-load-file-event.logic";

import { Line } from "../models/Line.model";

class ListStore extends Store {
  filePathName: string;
  contentFromFile: Array<string>;
  lines: Array<Line>;
  currentIndex: number;
  colours: Array<string>;
  listElementRef: HTMLUListElement;

  doNothing: MintEvent<HTMLFormElement>;

  constructor() {
    super({
      filePathName: null,
      contentFromFile: null,
      lines: [],
      currentIndex: null,
      colours: {},
      listElementRef: null,

      oninit: async () => {
        addKeyEvents();
        addLoadFileEvent();

        await wait();

        refresh(listStore);
      },

      doNothing(event) {
        event.preventDefault();
      },
    });
  }
}

export const listStore = new ListStore();
