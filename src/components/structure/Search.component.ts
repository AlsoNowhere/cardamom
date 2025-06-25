import { component, MintEvent, MintScope, node, refresh } from "mint";

import { Button, Field } from "thyme";

import { appStore } from "../../stores/app.store";
import { listStore } from "../../stores/list.store";

class SearchComponent extends MintScope {
  searchStartIndex: number | null;
  currentSearchIndex: number | null;

  close: () => void;
  onSubmit: MintEvent<HTMLFormElement>;
  goToNext: MintEvent;
  runSearch: (searchValue: string) => void;

  constructor() {
    super();

    this.searchStartIndex = null;
    this.currentSearchIndex = null;

    this.close = function () {
      appStore.isSearchOpen = false;
      refresh(appStore);
    };

    this.onSubmit = function (event, element, scope) {
      event.preventDefault();
      const searchValue = element.searchValue.value;
      scope.runSearch(searchValue);
    };

    this.goToNext = function () {
      this.searchStartIndex = this.currentSearchIndex + 1;
      const searchValue = document["search-form"].searchValue.value;
      this.runSearch(searchValue);
    }.bind(this);

    this.runSearch = function (searchValue: string) {
      if (searchValue === "") return;
      const linesSubset = listStore.lines.slice(this.searchStartIndex ?? 0);
      const _index = linesSubset.findIndex(({ content }) => content.toLowerCase().includes(searchValue.toLowerCase()));
      if (_index === -1) return;
      const index = this.searchStartIndex + _index;
      this.currentSearchIndex = index;
      const liElement = listStore.listElementRef.children[index] as HTMLLIElement;
      const offset = liElement.offsetTop;
      appStore.mainListElementRef.scrollTo(0, offset);
    };

    this.onremove = function () {
      this.searchStartIndex = null;
      this.currentSearchIndex = null;
      document["search-form"].searchValue.value = "";
    };
  }
}

export const Search = component("section", SearchComponent, { class: "search-bar" }, [
  node("header", { class: "search-bar__header" }, [
    node("h2", { class: "search-bar__header-title" }, "Search"),

    node(Button, { theme: "empty", icon: "times", class: "search-bar__header-button", "[onClick]": "close" })
  ]),

  node("form", { name: "search-form", class: "search-bar__content", "(submit)": "onSubmit" }, [
    node(Field, { name: "searchValue" }),
    node(Button, {
      icon: "arrow-down",
      class: "search-bar__button",
      "[onClick]": "goToNext"
    }),
    node(Button, { type: "submit", icon: "search", class: "search-bar__button" })
  ])
]);
