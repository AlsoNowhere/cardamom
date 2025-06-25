import { component, div, mIf, MintScope, mRef, node } from "mint";

import { Field } from "thyme";

import { Aside } from "./structure/Aside.component";
import { Controls } from "./tool-bars/Controls.component";
import { Options } from "./tool-bars/Options.component";
import { List } from "./list/List.component";
import { Search } from "./structure/Search.component";
import { Tabs } from "./structure/Tabs.component";
import { Modals } from "./structure/Modals.component";

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
    node(Tabs, {
      "[currentTabClass]": "currentTabClass"
    }),
    div({ class: "main__controls" }, [node(Controls), node(Options)]),
    div(
      { class: "main__list", style: "overflow-y: {isTextareaOverflow}", ...mRef("mainListElementRef") },

      node("form", { "(submit)": "doNothing" }, [
        node(List, { ...mIf("!isTextarea") }),

        node(Field, {
          ...mIf("isTextarea"),
          type: "textarea",
          "[value]": "textareaContent",
          labelClass: "list-item",
          style: "height: 100%;",
          readonly: true
        })
      ])
    ),

    node(Search, { ...mIf("isSearchOpen") })
  ]),

  node(Modals)
]);
