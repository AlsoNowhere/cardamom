import { component, MintEvent, MintScope, node, refresh } from "mint";

import { Button, Field } from "thyme";

import { appStore } from "../../stores/app.store";
import { listStore } from "../../stores/list.store";

const updateSearch = (index: number) => {
  const liElement = listStore.listElementRef.children[index] as HTMLLIElement;
  const offset = liElement.offsetTop;
  appStore.mainListElementRef.scrollTo(0, offset);
};

class SearchComponent extends MintScope {
  lineIndexMatches: Array<number>;
  currentSearchIndex: number | null;

  close: () => void;
  onSubmit: MintEvent<HTMLFormElement>;
  goToNext: MintEvent;
  goToPrevious: MintEvent;
  runSearch: (searchValue: string) => void;

  constructor() {
    super();

    this.lineIndexMatches = [];
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
      if (this.currentSearchIndex === this.lineIndexMatches.length - 1) return;
      this.currentSearchIndex++;
      const index = this.lineIndexMatches[this.currentSearchIndex];
      updateSearch(index);
    }.bind(this);

    this.goToPrevious = function () {
      if (this.currentSearchIndex === 0) return;
      this.currentSearchIndex--;
      const index = this.lineIndexMatches[this.currentSearchIndex];
      updateSearch(index);
    }.bind(this);

    this.runSearch = function (searchValue: string) {
      if (searchValue === "") return;

      this.lineIndexMatches = listStore.lines.reduce((a, b, i) => {
        if (b.content.toLowerCase().includes(searchValue.toLowerCase())) {
          a.push(i);
        }
        return a;
      }, [] as Array<number>);

      this.currentSearchIndex = 0;
      const index = this.lineIndexMatches[this.currentSearchIndex];
      updateSearch(index);
    };

    this.onremove = function () {
      this.currentSearchIndex = null;
      document["search-form"].searchValue.value = "";
    };
  }
}

export const Search = component("section", SearchComponent, { class: "search-bar" }, [
  node("header", { class: "search-bar__header" }, [
    node("h2", { class: "search-bar__header-title" }, "Search"),

    node(Button, { theme: "empty", icon: "times", class: "search-bar__header-button", "[onClick]": "close" }),
  ]),

  node("form", { name: "search-form", class: "search-bar__content", "(submit)": "onSubmit" }, [
    node(Field, { name: "searchValue" }),
    node(Button, {
      icon: "arrow-down",
      class: "search-bar__button",
      "[onClick]": "goToNext",
    }),
    node(Button, {
      icon: "arrow-up",
      class: "search-bar__button",
      "[onClick]": "goToPrevious",
    }),
    node(Button, { type: "submit", icon: "search", class: "search-bar__button" }),
  ]),
]);
