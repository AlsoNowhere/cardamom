import { component, node } from "mint";

import { Button } from "thyme";

const lineProps = (x1: string, x2: string) => ({
  x1,
  y1: "4",
  x2,
  y2: "28",
  stroke: "#fff",
  "stroke-width": "2px",
});

export const Header = component("header", null, { class: "header" }, [
  node("h1", { class: "header__title" }, "Cardamom"),

  node("div", { class: "flex" }, [
    node(
      Button,
      {
        theme: "empty",
        class: "header__button snow-text",
        large: true,
        square: true,
      },
      node("span", null, "_")
    ),
    node(
      Button,
      {
        theme: "empty",
        class: "header__button",
        large: true,
        square: true,
      },
      node(
        "svg",
        {
          class: "absolute middle width height",
          viewBox: "0 0 32 32",
        },
        [node("line", lineProps("4", "28")), node("line", lineProps("28", "4"))]
      )
    ),
  ]),
]);
