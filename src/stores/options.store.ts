import { Store } from "mint";

import { toggleBold } from "../logic/toggle-bold.logic";
import { toggleItalic } from "../logic/toggle-italic.logic";
import { toggleUnderline } from "../logic/toggle-underline.logic";
import { changeColour } from "../logic/change-colour.logic";

import { colours } from "../data/colours.data";

class OptionsStore extends Store {
  colours: Array<string>;

  toggleBold: () => void;
  changeColour: () => void;

  constructor() {
    super({ colours, toggleBold, toggleItalic, toggleUnderline, changeColour });
  }
}

export const optionsStore = new OptionsStore();
