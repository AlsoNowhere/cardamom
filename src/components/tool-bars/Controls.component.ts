import { component, div, mIf, MintScope, node } from "mint";

import { Button, Field } from "thyme";

import { controlsStore } from "../../stores/controls.store";

class ControlsComponent extends MintScope {
  constructor() {
    super();

    controlsStore.connect(this);
  }
}

export const Controls = component("section", ControlsComponent, { class: "main__controls-section" }, [
  node(
    "form",
    {
      class: "main__controls-form",
      "(submit)": "doNothing"
    },
    node("<>", { ...mIf("hasFileLoaded") }, [
      node(Field, {
        "[value]": "fileName",
        "[onInput]": "updateFileName"
      }),
      node("span", { class: "main__controls-location" }, "{fileLocation}")
    ])
  ),

  div([
    node(Button, {
      icon: "download",
      class: "margin-right-small",
      title: "Open file",
      square: true,
      "[onClick]": "openFile"
    }),

    node(Button, {
      theme: "blueberry",
      icon: "floppy-o",
      class: "margin-right-small",
      title: "Save content to file",
      square: true,
      "[onClick]": "saveToFile"
    }),

    node(Button, {
      "[theme]": "isTextareaTheme",
      icon: "file-text-o",
      class: "margin-right-small",
      title: "Toggle textarea",
      square: true,
      "[onClick]": "toggleTextarea"
    }),

    node(Button, {
      icon: "search",
      class: "margin-right-small",
      title: "Open search",
      square: true,
      "[onClick]": "openSearch"
    })
  ])
]);
