import { MintEvent, Store } from "mint";

import { Line } from "../models/Line.model";

import { defaultFontSize } from "../data/constants.data";

class ListStore extends Store {
  filePathName: string;
  contentFromFile: Array<string>;
  lines: Array<Line>;
  currentIndex: number;
  lastCurrentIndex: number;
  colours: Array<string>;
  fontSize: number;
  listElementRef: HTMLUListElement;

  doNothing: MintEvent<HTMLFormElement>;

  onTextarea: MintEvent<HTMLTextAreaElement>;

  constructor() {
    super({
      filePathName: null,
      contentFromFile: null,
      lines: [],
      currentIndex: null,
      lastCurrentIndex: null,
      colours: {},
      fontSize: defaultFontSize,
      listElementRef: null,

      doNothing(event) {
        event.preventDefault();
      }
    });
  }
}

export const listStore = new ListStore();
