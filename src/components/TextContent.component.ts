import { component, MintScope, mRef, node } from "mint";

import { textStore } from "../stores/text.store";

class TextContentComponent extends MintScope {
  constructor() {
    super();

    textStore.connect(this);
  }
}

export const TextContent = component(
  "div",
  TextContentComponent,
  { class: "relative" },
  [
    node("div", {
      contentEditable: true,
      "[innerHTML]": "content",
      class: "width-full padding-small smoke-border rounded",
      style: "{textAreaHeight}",
      "(input)": "insertText",
      ...mRef("textElementRef"),
    }),
  ]
);
