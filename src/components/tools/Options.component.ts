import { component, mFor, MintScope, node } from "mint";

import { Button } from "thyme";

import { styles } from "sage";

import { optionsStore } from "../../stores/options.store";

class OptionsComponent extends MintScope {
  constructor() {
    super();

    optionsStore.connect(this);
  }
}

export const Options = component(
  "div",
  OptionsComponent,
  { class: "flex margin-bottom-large" },
  [
    node(Button, {
      label: "B",
      class: "margin-right-small bold",
      large: true,
      square: true,
      "[onClick]": "toggleBold",
    }),

    node(Button, {
      label: "I",
      class: "margin-right-small italic",
      large: true,
      square: true,
      "[onClick]": "toggleItalic",
    }),

    node(Button, {
      label: "U",
      class: "margin-right-small underline",
      large: true,
      square: true,
      "[onClick]": "toggleUnderline",
    }),

    node(
      Button,
      {
        ...mFor("colours"),
        mKey: "_i",
        class: "margin-right-small",
        large: true,
        square: true,
        "[onClick]": "changeColour",
        "[colour]": "_x",
      },
      node(
        "svg",
        {
          class: "rounded",
          style: styles({ width: "24px", height: "24px" }),
          viewBox: "0 0 32 32",
        },
        [
          node("rect", {
            x: 0,
            y: 0,
            width: 32,
            height: 32,
            "[fill]": "colour",
            stroke: "#ccc",
            "stroke-width": 4,
            rx: 6,
            ry: 6,
          }),
        ]
      )
    ),
  ]
);
