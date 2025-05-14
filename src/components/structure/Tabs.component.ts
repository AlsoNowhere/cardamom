import { component, mFor, MintScope, node, span } from "mint";

import { Button } from "thyme";

import { tabsStore } from "../../stores/tabs.store";

class TabsComponent extends MintScope {
  constructor() {
    super();

    tabsStore.connect(this);
  }
}

export const Tabs = component("div", TabsComponent, { class: "main__tabs" }, [
  node(
    "ul",
    { class: "main__tabs-list" },
    node(
      "li",
      { ...mFor("tabs"), mKey: "_i", class: "main__tabs-list-item {currentTabClass}", "(click)": "selectTab" },
      [
        span("{fileName}"),
        node(Button, {
          theme: "empty",
          icon: "times",
          class: "snow-text",
          square: true,
          "[onClick]": "removeTab",
          "[index]": "_i"
        })
      ]
    )
  )
]);
