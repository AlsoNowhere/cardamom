import { component, mFor, MintScope, mRef, node } from "mint";

import { Button, ColourSelector, Field, TField } from "thyme";

import { optionsStore } from "../../stores/options.store";
import { togglesStore } from "../../stores/toggles.store";

class TogglesComponent extends MintScope {
  constructor() {
    super();

    togglesStore.connect(this);
  }
}

const Toggles = component(
  "<>",
  TogglesComponent,
  null,
  node(Button, {
    ...mFor("options"),
    mKey: "_i",
    "[theme]": "theme",
    square: true,
    "[content]": "content",
    "[onClick]": "action"
  })
);

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
    class: "margin-bottom-small"
  },
  node("ul", { class: "list flex" }, [
    node(Toggles, { "[options]": "options" }),
    node(ColourSelector, { "[onInput]": "chooseColour" }),
    node<TField>(Field, {
      type: "number",
      class: "margin-left",
      "[value]": "fontSize",
      "[onInput]": "changeFontSize",
      extendField: { min: "8", max: "22" }
    })
  ])
);
