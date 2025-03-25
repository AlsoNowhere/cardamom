import { component, MintScope, node } from "mint";

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
  node("main", { class: "padding-large" }, [
    node(Controls),
    node(Options),
    node(List),
  ]),
]);
