import { saveData } from "./save.logic";

import { textStore } from "../stores/text.store";

export const toggleUnderline = () => {
  const selection = document.getSelection();
  const range = selection.getRangeAt(0);
  const { startOffset, endOffset, startContainer, endContainer } = range;

  if (startContainer !== endContainer) return;

  if (startOffset !== 0 || endOffset !== endContainer.textContent.length)
    return;

  const element = textStore.textElementRef.ref;

  if (endContainer.parentElement.nodeName === "SPAN") {
    const span = endContainer.parentElement as HTMLSpanElement;
    if (span.style["text-decoration"] === "underline") {
      span.style["text-decoration"] = null;
    } else {
      span.style["text-decoration"] = "underline";
    }
  } else {
    const span = document.createElement("SPAN");
    span.textContent = endContainer.textContent;
    span.style["text-decoration"] = "underline";
    element.insertBefore(span, endContainer);
    element.removeChild(endContainer);
  }

  textStore.content = element.innerHTML;

  saveData();
};
