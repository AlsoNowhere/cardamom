import { component, MintScope, node } from "mint";

import { Aside } from "./structure/Aside.component";
import { Controls } from "./tool-bars/Controls.component";
import { Options } from "./tool-bars/Options.component";
import { List } from "./list/List.component";

class AppComponent extends MintScope {
  constructor() {
    super();
  }
}

export const App = component("<>", AppComponent, {}, [
  node(Aside),
  node("main", { class: "padding-large" }, [
    node(Controls),
    node(Options),
    node(List),
  ]),
]);
