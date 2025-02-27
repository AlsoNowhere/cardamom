import { component, mFor, MintScope, mRef, node } from "mint";

import { Button } from "thyme";

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
  { class: "margin-bottom", ...mRef("optionsElementRef") },
  node(
    "ul",
    { class: "list flex" },
    node(Button, {
      ...mFor("options"),
      mKey: "_i",
      large: true,
      square: true,
      "[content]": "content",
      "[onClick]": "action",
    })
  )
);
