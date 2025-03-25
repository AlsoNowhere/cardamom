import { component, div, mIf, MintScope, node } from "mint";

import { Button, Field } from "thyme";

import { controlsStore } from "../../stores/controls.store";

class ControlsComponent extends MintScope {
  constructor() {
    super();

    controlsStore.connect(this);
  }
}

export const Controls = component(
  "section",
  ControlsComponent,
  { class: "margin-bottom-small" },
  [
    node(
      "form",
      {
        ...mIf("hasFileLoaded"),
        class: "margin-bottom-small",
        "(submit)": "doNothing",
      },
      node(Field, { "[value]": "filePathName", "[onInput]": "updateFileName" })
    ),

    div([
      node(Button, {
        icon: "download",
        class: "margin-right-small",
        square: true,
        "[onClick]": "openFile",
      }),

      node(Button, {
        theme: "blueberry",
        icon: "floppy-o",
        square: true,
        "[onClick]": "saveToFile",
      }),
    ]),
  ]
);
