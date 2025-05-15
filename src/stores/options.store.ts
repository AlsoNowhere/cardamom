import { MintEvent, refresh, Resolver, Store } from "mint";

import { changeStyle } from "../logic/common/change-style.logic";

import { listStore } from "./list.store";

import { Option } from "../models/Option.model";

import { options } from "../data/options.data";

const chooseColour = (colour: string) => {
  changeStyle("color", colour);
};

const changeFontSize: MintEvent<HTMLInputElement> = (_, element) => {
  const value = parseInt(element.value);
  if (value < 8 || value > 22) return;
  listStore.fontSize = value;
  refresh(listStore);
};

class OptionsStore extends Store {
  isBoldy: boolean;
  options: Array<Option>;
  fontSize: Resolver<number>;

  optionsElementRef: HTMLElement;

  chooseColour: (colour: string) => void;
  changeFontSize: MintEvent<HTMLInputElement>;

  constructor() {
    super({
      isBoldy: true,
      options,
      fontSize: new Resolver(() => listStore.fontSize),

      optionsElementRef: null,

      chooseColour,
      changeFontSize
    });
  }
}

export const optionsStore = new OptionsStore();
