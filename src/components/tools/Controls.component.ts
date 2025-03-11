import {
  component,
  div,
  mIf,
  MintEvent,
  MintScope,
  node,
  Resolver,
} from "mint";

import { Button, Field } from "thyme";

import { saveToFile } from "../../logic/save-to-file.logic";
import { mainStore } from "../../stores/main.store";

class ControlsComponent extends MintScope {
  hasFileLoaded: Resolver<boolean>;
  filePathName: Resolver<string>;
  doNothing: MintEvent;
  updateFileName: MintEvent<HTMLInputElement>;
  openFile: () => void;
  saveToFile: () => void;

  constructor() {
    super();

    this.hasFileLoaded = new Resolver(() => mainStore.filePathName !== null);

    this.filePathName = new Resolver(() =>
      mainStore.filePathName.split("\\").pop().split(".").shift()
    );

    this.doNothing = (event) => event.preventDefault();

    this.updateFileName = (_, element) => {
      const filePath = mainStore.filePathName
        .split("\\")
        .slice(0, -1)
        .join("\\");
      const newValue = filePath + "\\" + element.value + ".rtf";
      mainStore.filePathName = newValue;
    };

    this.openFile = () => {
      window.dispatchEvent(new Event("loadFromFile"));
    };

    this.saveToFile = () => {
      saveToFile();
    };
  }
}

export const Controls = component("section", ControlsComponent, {}, [
  node(
    "form",
    {
      ...mIf("hasFileLoaded"),
      class: "margin-bottom",
      "(submit)": "doNothing",
    },
    node(Field, { "[value]": "filePathName", "[onInput]": "updateFileName" })
  ),

  div({ class: "margin-bottom" }, [
    node(Button, {
      icon: "download",
      class: "margin-right-small",
      large: true,
      square: true,
      "[onClick]": "openFile",
    }),

    node(Button, {
      theme: "blueberry",
      icon: "floppy-o",
      large: true,
      square: true,
      "[onClick]": "saveToFile",
    }),
  ]),
]);
