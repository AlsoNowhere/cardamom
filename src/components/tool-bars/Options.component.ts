import { component, mFor, MintScope, mRef, node } from "mint";

import { Button, ColourSelector } from "thyme";

import { optionsStore } from "../../stores/options.store";

class OptionsComponent extends MintScope {
  constructor() {
    super();

    optionsStore.connect(this);
  }
}

export const Options = component(
  "section",
  OptionsComponent,
  {
    ...mRef("optionsElementRef"),
  },
  node("ul", { class: "list flex" }, [
    node(Button, {
      ...mFor("options"),
      mKey: "_i",
      "[theme]": "theme",
      square: true,
      "[content]": "content",
      "[onClick]": "action",
    }),
    node(ColourSelector, { "[onInput]": "chooseColour" }),
  ])
);
