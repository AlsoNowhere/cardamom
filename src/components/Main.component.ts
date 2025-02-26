import { component, div, MintEvent, MintScope, node } from "mint";

import { Options } from "./tools/Options.component";
import { TextContent } from "./TextContent.component";

class MainComponent extends MintScope {
  doNothing: MintEvent;

  constructor() {
    super();

    this.doNothing = (event) => event.preventDefault();
  }
}

export const Main = component(
  "main",
  MainComponent,
  { class: "padding-top-large" },
  [
    div({ class: "constrain centred" }, [
      node(Options),

      node(TextContent, { "[textElementRef]": "textElementRef" }),
    ]),
  ]
);
