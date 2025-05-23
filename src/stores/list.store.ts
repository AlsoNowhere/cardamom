import { MintEvent, Resolver, Store } from "mint";

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

  textareaContent: Resolver<string>;

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

      textareaContent: new Resolver(() => {
        return listStore.lines.map((x) => x.content).join("\n");
      }),

      doNothing(event) {
        event.preventDefault();
      }
    });
  }
}

export const listStore = new ListStore();
