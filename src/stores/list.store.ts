import { MintEvent, Store } from "mint";

import { Line } from "../models/Line.model";

class ListStore extends Store {
  filePathName: string;
  contentFromFile: Array<string>;
  lines: Array<Line>;
  currentIndex: number;
  lastCurrentIndex: number;
  colours: Array<string>;
  listElementRef: HTMLUListElement;

  doNothing: MintEvent<HTMLFormElement>;

  constructor() {
    super({
      filePathName: null,
      contentFromFile: null,
      lines: [],
      currentIndex: null,
      lastCurrentIndex: null,
      colours: {},
      listElementRef: null,

      doNothing(event) {
        event.preventDefault();
      },
    });
  }
}

export const listStore = new ListStore();
