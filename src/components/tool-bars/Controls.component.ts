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
import { listStore } from "../../stores/list.store";

class ControlsComponent extends MintScope {
  hasFileLoaded: Resolver<boolean>;
  filePathName: Resolver<string>;
  doNothing: MintEvent;
  updateFileName: MintEvent<HTMLInputElement>;
  openFile: () => void;
  saveToFile: () => void;

  constructor() {
    super();

    this.hasFileLoaded = new Resolver(() => listStore.filePathName !== null);

    this.filePathName = new Resolver(() =>
      listStore.filePathName.split("\\").pop().split(".").shift()
    );

    this.doNothing = (event) => event.preventDefault();

    this.updateFileName = (_, element) => {
      const filePath = listStore.filePathName
        .split("\\")
        .slice(0, -1)
        .join("\\");
      const newValue = filePath + "\\" + element.value + ".rtf";
      listStore.filePathName = newValue;
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
]);
