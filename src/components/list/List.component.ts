import { component, mFor, mIf, MintScope, mRef, node } from "mint";

import { Field } from "thyme";

import { ListItem } from "./ListItem.component";

import { listStore } from "../../stores/list.store";

class ListComponent extends MintScope {
  constructor() {
    super();

    listStore.connect(this);
  }
}

export const List = component("div", ListComponent, {}, [
  node("form", { "(submit)": "doNothing" }, [
    node(
      "ul",
      { ...mIf("!isTextarea"), class: "list", ...mRef("listElementRef") },
      node("li", { ...mFor("lines"), mKey: "id", class: "list-item" }, [
        node(ListItem, {
          "[content]": "content",
          "[style]": "getStyles",
          "[index]": "_i"
        })
      ])
    ),

    node(Field, {
      ...mIf("isTextarea"),
      type: "textarea",
      "[value]": "textareaContent",
      labelClass: "list-item",
      style: "height: 100%;",
      extendField: {
        readonly: true
      }
    })
  ])
]);
