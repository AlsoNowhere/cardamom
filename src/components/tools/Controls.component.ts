import { component, MintScope, node } from "mint";

import { Button } from "thyme";

import { saveToFile } from "../../logic/save-to-file.logic";

class ControlsComponent extends MintScope {
  openFile: () => void;
  saveToFile: () => void;

  constructor() {
    super();

    this.openFile = () => {
      window.dispatchEvent(new Event("loadFromFile"));
    };

    this.saveToFile = () => {
      saveToFile();
    };
  }
}

export const Controls = component("section", ControlsComponent, {}, [
  node(Button, {
    icon: "download",
    class: "margin-right-small margin-bottom",
    large: true,
    square: true,
    "[onClick]": "openFile",
  }),

  node(Button, {
    theme: "blueberry",
    icon: "floppy-o",
    class: "margin-bottom",
    large: true,
    square: true,
    "[onClick]": "saveToFile",
  }),
]);
