import { component, div, mFor, MintEvent, MintScope, node } from "mint";

import { wait } from "sage";

import { Button, Field, TField } from "thyme";

import { saveData } from "../logic/save.logic";
import { addLine } from "../logic/add-line.logic";
import { deleteLine } from "../logic/delete-line.logic";
import { inputKeyDown } from "../logic/input-keydown.logic";

import { mainStore } from "../stores/main.store";
import { optionsStore } from "../stores/options.store";

const inputChange: MintEvent<HTMLInputElement> = function (_, element) {
  mainStore.lines[this.index].content = element.value;
  saveData();
};

const inputFocus = async function () {
  await wait();
  mainStore.currentIndex = this.index;
};

const inputBlur = async () => {
  await wait();

  if (!optionsStore.optionsElementRef.contains(document.activeElement)) {
    mainStore.currentIndex = null;
  }
};

// const addLabel = function () {
//   // const line = mainStore.lines[this.index];
//   // saveData();
//   // refresh(mainStore);
// };

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
      // { theme: "snow", label: "L", class: "label", action: addLabel },
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

  div(
    {
      ...mFor("buttons"),
      mKey: "_i",
      class: "list-item__button list-item__button--{class}",
    },
    node(Button, {
      "[theme]": "theme",
      "[icon]": "icon",
      "[label]": "label",
      square: true,
      "[onClick]": "action",
      "[index]": "index",
    })
  ),
]);
