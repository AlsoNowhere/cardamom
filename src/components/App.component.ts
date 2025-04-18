import { component, div, MintScope, node } from "mint";

import { Aside } from "./structure/Aside.component";
import { Controls } from "./tool-bars/Controls.component";
import { Options } from "./tool-bars/Options.component";
import { List } from "./list/List.component";

import { appStore } from "../stores/app.store";

class AppComponent extends MintScope {
  constructor() {
    super();

    appStore.connect(this);
  }
}

export const App = component("<>", AppComponent, {}, [
  node(Aside),
  node("main", null, [
    div({ class: "main__controls" }, [node(Controls), node(Options)]),
    div(
      { class: "main__list", style: "overflow-y: {isTextareaOverflow}" },
      node(List, { "[isTextarea]": "isTextarea" })
    ),
  ]),
]);
