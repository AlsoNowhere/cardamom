import { component, MintScope, node } from "mint";

import { Main } from "./structure/Main.component";

import { Aside } from "./structure/Aside.component";

class AppComponent extends MintScope {
  constructor() {
    super();
  }
}

export const App = component("<>", AppComponent, {}, [node(Aside), node(Main)]);
