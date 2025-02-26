import { saveData } from "./save.logic";

import { textStore } from "../stores/text.store";

export const toggleItalic = () => {
  const selection = document.getSelection();
  const range = selection.getRangeAt(0);
  const { startOffset, endOffset, startContainer, endContainer } = range;

  if (startContainer !== endContainer) return;

  if (startOffset !== 0 || endOffset !== endContainer.textContent.length)
    return;

  const element = textStore.textElementRef.ref;

  if (endContainer.parentElement.nodeName === "SPAN") {
    const span = endContainer.parentElement as HTMLSpanElement;
    if (span.style["font-style"] === "italic") {
      span.style["font-style"] = null;
    } else {
      span.style["font-style"] = "italic";
    }
  } else {
    const span = document.createElement("SPAN");
    span.textContent = endContainer.textContent;
    span.style["font-style"] = "italic";
    element.insertBefore(span, endContainer);
    element.removeChild(endContainer);
  }

  textStore.content = element.innerHTML;

  saveData();
};
