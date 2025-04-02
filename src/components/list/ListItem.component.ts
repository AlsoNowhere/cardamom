import {
  component,
  div,
  mFor,
  MintEvent,
  MintScope,
  node,
  refresh,
} from "mint";

import { Button, Field, TField } from "thyme";

import { addLine } from "../../logic/add-line.logic";
import { deleteLine } from "../../logic/delete-line.logic";
import { inputKeyDown } from "../../logic/input-keydown.logic";

import { listStore } from "../../stores/list.store";
import { optionsStore } from "../../stores/options.store";
import { togglesStore } from "../../stores/toggles.store";

import { options } from "../../data/options.data";

const inputChange: MintEvent<HTMLInputElement> = function (_, element) {
  listStore.lines[this.index].content = element.value;
};

const inputFocus = function () {
  listStore.currentIndex = this.index;
  listStore.lastCurrentIndex = this.index;

  if (listStore.lines[this.index].styles["font-weight"] === "bold") {
    options[0].theme = "blueberry";
  } else {
    options[0].theme = undefined;
  }

  if (listStore.lines[this.index].styles["font-style"] === "italic") {
    options[1].theme = "blueberry";
  } else {
    options[1].theme = undefined;
  }

  if (listStore.lines[this.index].styles["text-decoration"] === "underline") {
    options[2].theme = "blueberry";
  } else {
    options[2].theme = undefined;
  }

  refresh(optionsStore);
};

const inputBlur = () => {
  listStore.currentIndex = null;

  options[0].theme = undefined;
  options[1].theme = undefined;
  options[2].theme = undefined;

  refresh(togglesStore);
};

class ListItemComponent extends MintScope {
  index: number;
  buttons: Array<{
    theme: string;
    icon?: string;
    label?: string;
    class: string;
    action: () => void;
  }>;

  inputKeyDown: MintEvent<HTMLInputElement>;
  inputChange: MintEvent<HTMLInputElement>;
  inputFocus: MintEvent<HTMLInputElement>;
  inputBlur: MintEvent<HTMLInputElement>;
  addLine: () => void;
  deleteLine: () => void;

  constructor() {
    super();

    this.buttons = [
      { theme: "snow", icon: "level-down", class: "add", action: addLine },
      { theme: "tomato", icon: "trash-o", class: "delete", action: deleteLine },
    ];

    this.inputKeyDown = inputKeyDown;
    this.inputChange = inputChange;
    this.inputFocus = inputFocus;
    this.inputBlur = inputBlur;
    this.addLine = addLine;
    this.deleteLine = deleteLine;
  }
}

export const ListItem = component("div", ListItemComponent, {}, [
  node<TField>(Field, {
    "[value]": "content",
    "[style]": "style",
    "[onKeyDown]": "inputKeyDown",
    "[onInput]": "inputChange",
    "[onFocus]": "inputFocus",
    "[onBlur]": "inputBlur",
    "[index]": "index",
    extend: {
      "[index]": "index",
    },
  }),

  // div(
  //   {
  //     ...mFor("buttons"),
  //     mKey: "_i",
  //     class: "list-item__button list-item__button--{class}",
  //   },
  //   node(Button, {
  //     "[theme]": "theme",
  //     "[icon]": "icon",
  //     "[label]": "label",
  //     square: true,
  //     "[onClick]": "action",
  //     "[index]": "index",
  //   })
  // ),
]);
