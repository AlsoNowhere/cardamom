import { component, mFor, MintScope, mRef, node } from "mint";

import { ListItem } from "./ListItem.component";
import { Options } from "./tools/Options.component";

import { mainStore } from "../stores/main.store";

class MainComponent extends MintScope {
  constructor() {
    super();

    mainStore.connect(this);
  }
}

export const Main = component(
  "main",
  MainComponent,
  { class: "padding-large" },
  [
    node(Options),

    node(
      "form",
      { class: "card snow-bg", "(submit)": "doNothing" },
      node(
        "ul",
        { class: "list", ...mRef("listElementRef") },
        node("li", { ...mFor("lines"), mKey: "id", class: "list-item" }, [
          node(ListItem, {
            "[content]": "content",
            "[style]": "getStyles",
            "[index]": "_i",
          }),
        ])
      )
    ),
  ]
);
