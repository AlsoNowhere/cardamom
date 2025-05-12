import { component, MintEvent, MintScope, node, refresh } from "mint";

import { Button, Field } from "thyme";

import { appStore } from "../../stores/app.store";
import { listStore } from "../../stores/list.store";

class SearchComponent extends MintScope {
  close: () => void;
  runSearch: MintEvent<HTMLFormElement>;

  constructor() {
    super();

    this.close = function () {
      appStore.isSearchOpen = false;
      refresh(appStore);
    };

    this.runSearch = function (event, element) {
      event.preventDefault();
      const searchValue = element.searchValue.value;
      if (searchValue === "") return;
      const index = listStore.lines.findIndex((x) => x.content.includes(searchValue));
      if (index === -1) return;
      const liElement = listStore.listElementRef.children[index] as HTMLLIElement;
      const offset = liElement.offsetTop;
      appStore.mainListElementRef.scrollTo(0, offset);
    };
  }
}

export const Search = component("section", SearchComponent, { class: "search-bar" }, [
  node("header", { class: "search-bar__header" }, [
    node("h2", { class: "search-bar__header-title" }, "Search"),

    node(Button, { theme: "empty", icon: "times", "[onClick]": "close" })
  ]),

  node("form", { class: "search-bar__content", "(submit)": "runSearch" }, [
    node(Field, { name: "searchValue" }),
    node(Button, { type: "submit", icon: "search", class: "search-bar__button" })
  ])
]);
