import { MintEvent, Resolver, Store, UpwardRef } from "mint";

import { insertText } from "../logic/insert-text.logic";

class TextStore extends Store {
  content: string;
  height: number;

  textAreaHeight: Resolver<string>;

  insertText: MintEvent<HTMLDivElement>;

  textElementRef: UpwardRef<HTMLDivElement>;

  constructor() {
    super({
      content: "",
      height: 200,

      textAreaHeight: new Resolver(() => `height: ${textStore.height}px;`),

      insertText,

      textElementRef: new UpwardRef(null),
    });
  }
}

export const textStore = new TextStore();
