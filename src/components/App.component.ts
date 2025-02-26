import { component, MintScope, node, refresh } from "mint";

import { wait } from "sage";

import { Header } from "./structure/Header.component";
import { Main } from "./Main.component";

import { loadData } from "../logic/load.logic";

import { textStore } from "../stores/text.store";

class AppComponent extends MintScope {
  constructor() {
    super();

    this.oninit = async () => {
      await wait();
      loadData();
      refresh(textStore);
    };

    this.onafterinsert = async () => {
      await wait();
      textStore.textElementRef.ref.focus();
    };
  }
}

export const App = component("<>", AppComponent, {}, [
  node(Header),
  node(Main),
]);
