import { MintEvent } from "mint";

import { addLine } from "./add-line.logic";
import { deleteLine } from "./delete-line.logic";
import {
  toggleBold,
  toggleItalic,
  toggleUnderline,
} from "./options-toggles.logic";

import { listStore } from "../stores/list.store";

import { keysHeld } from "../data/keys-held.data";

export const inputKeyDown: MintEvent<HTMLInputElement> = function (
  event: KeyboardEvent
) {
  const { key } = event;

  if (key === "Enter") {
    addLine.apply(this);
    const element = listStore.listElementRef.children[this.index + 1];
    const inputElement = element.querySelector("input");
    inputElement.focus();
  }

  if (key === "Delete" && keysHeld.Control) {
    deleteLine.apply(this);
    const element = listStore.listElementRef.children[this.index];
    if (!!element) {
      const inputElement = element.querySelector("input");
      inputElement.focus();
    }
  }

  if (key === "ArrowUp") {
    if (this.index !== 0) {
      const element = listStore.listElementRef.children[this.index - 1];
      const inputElement = element.querySelector("input");
      inputElement.focus();
    }
  }

  if (key === "ArrowDown") {
    if (this.index !== listStore.lines.length - 1) {
      const element = listStore.listElementRef.children[this.index + 1];
      const inputElement = element.querySelector("input");
      inputElement.focus();
    }
  }

  if (key === "b" && keysHeld.Control) {
    toggleBold();
  }

  if (key === "i" && keysHeld.Control) {
    toggleItalic();
  }

  if (key === "u" && keysHeld.Control) {
    event.preventDefault();
    toggleUnderline();
  }
};
