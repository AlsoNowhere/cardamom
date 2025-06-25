import { component, mFor, MintScope, node, span } from "mint";

import { Button } from "thyme";

import { tabsStore } from "../../stores/tabs.store";

class TabsComponent extends MintScope {
  constructor() {
    super();

    tabsStore.connect(this);
  }
}

export const Tabs = component("div", TabsComponent, { class: "tabs" }, [
  node(
    "ul",
    { class: "tabs__list" },
    node("li", { ...mFor("tabs"), mKey: "_i", class: "tabs__list-item {currentTabClass}", "(click)": "selectTab" }, [
      span("{fileName}"),
      node(Button, {
        theme: "empty",
        icon: "times",
        class: "margin-left-small {getClasses}",
        square: true,
        "[onClick]": "removeTab",
        "[index]": "_i"
      })
    ])
  )
]);
