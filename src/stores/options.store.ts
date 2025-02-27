import { node, Store } from "mint";

import {
  toggleBold,
  toggleItalic,
  toggleUnderline,
} from "../logic/options-toggles.logic";

import { Option } from "../models/Option.model";

import { colours } from "../data/colours.data";
import { changeColour } from "../logic/change-colour.logic";

const svgSquare = (colour: string) =>
  node("svg", { viewBox: "0 0 64 64" }, [
    node("rect", {
      x: 16,
      y: 16,
      width: "32px",
      height: "32px",
      stroke: colour,
      "stroke-width": "4px",
      fill: "transparent",
      rx: "6%",
      ry: "6%",
    }),
  ]);

const colourButtons = colours.map(
  (x) => new Option({ content: svgSquare(x), action: changeColour(x) })
);

const options = [
  new Option({ label: "B", class: "bold", action: toggleBold }),
  new Option({ label: "I", class: "italic", action: toggleItalic }),
  new Option({ label: "U", class: "underline", action: toggleUnderline }),
  ...colourButtons,
];

class OptionsStore extends Store {
  options: Array<Option>;

  optionsElementRef: HTMLElement;

  constructor() {
    super({
      options,

      optionsElementRef: null,
    });
  }
}

export const optionsStore = new OptionsStore();
