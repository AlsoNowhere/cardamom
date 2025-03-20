import { Store } from "mint";

import { changeStyle } from "../logic/common/change-style.logic";

import { Option } from "../models/Option.model";

import { options } from "../data/options.data";

const chooseColour = (colour: string) => {
  changeStyle("color", colour);
};

class OptionsStore extends Store {
  isBoldy: boolean;
  options: Array<Option>;
  optionsElementRef: HTMLElement;

  constructor() {
    super({
      isBoldy: true,
      options,
      chooseColour,
      optionsElementRef: null,
    });
  }
}

export const optionsStore = new OptionsStore();
