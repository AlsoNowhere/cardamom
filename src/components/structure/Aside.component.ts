import { component, div, MintScope, node, span } from "mint";

import { Button } from "thyme";

const size = 8;

const lineProps = (x1: number, x2: number) => ({
  x1,
  y1: size,
  x2,
  y2: 32 - size,
  stroke: "#fff",
  "stroke-width": "1.5px",
});

class AsideComponent extends MintScope {
  constructor() {
    super();
  }
}

export const Aside = component("aside", AsideComponent, { class: "aside" }, [
  div({ class: "aside__title-container" }, [
    span({ class: "aside__title" }, "Cardamom"),
  ]),

  node(Button, {
    theme: "empty",
    label: "_",
    large: true,
    square: true,
    class: "snow-text",
  }),

  node(
    Button,
    { theme: "empty", label: "_", large: true, square: true },
    node(
      "svg",
      {
        class: "absolute middle width height",
        viewBox: "0 0 32 32",
      },
      [
        node("line", lineProps(size, 32 - size)),
        node("line", lineProps(32 - size, size)),
      ]
    )
  ),
]);
