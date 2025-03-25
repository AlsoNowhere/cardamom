import { node } from "mint";

// import { fontDown } from "../logic/font-down.logic";
// import { fontUp } from "../logic/font-up.logic";
import {
  toggleBold,
  toggleItalic,
  toggleUnderline,
} from "../logic/options-toggles.logic";

import { Option } from "../models/Option.model";

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

export const options = [
  new Option({
    theme: undefined,
    label: "B",
    class: "bold",
    title: "Make bold",
    action: toggleBold,
  }),
  new Option({
    theme: undefined,
    label: "I",
    class: "italic",
    title: "Make italic",
    action: toggleItalic,
  }),
  new Option({
    theme: undefined,
    label: "U",
    class: "underline",
    title: "Make underline",
    action: toggleUnderline,
  }),
  // new Option({ icon: "level-up", title: "Increase font size", action: fontUp }),
  // new Option({
  //   icon: "level-down",
  //   title: "Decrease font size",
  //   action: fontDown,
  // }),
];
