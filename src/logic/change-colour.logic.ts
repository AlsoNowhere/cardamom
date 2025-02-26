import { saveData } from "./save.logic";

import { textStore } from "../stores/text.store";

export const changeColour = function () {
  const selection = document.getSelection();
  const range = selection.getRangeAt(0);
  const { startOffset, endOffset, startContainer, endContainer } = range;

  if (startContainer !== endContainer) return;

  if (startOffset !== 0 || endOffset !== endContainer.textContent.length)
    return;

  const element = textStore.textElementRef.ref;
  const colour = this.colour === "black" ? null : this.colour;

  if (endContainer.parentElement.nodeName === "SPAN") {
    const span = endContainer.parentElement as HTMLSpanElement;
    if (span.style.color === colour) {
      span.style.color = null;
    } else {
      span.style.color = colour;
    }
  } else {
    const span = document.createElement("SPAN");
    span.textContent = endContainer.textContent;
    span.style.color = colour;
    element.insertBefore(span, endContainer);
    element.removeChild(endContainer);
  }

  textStore.content = element.innerHTML;

  saveData();
};
