import { resolveSaveContent } from "./resolve-content.logic";
import { resolveSaveColours } from "./save/resolve-colours.logic";

import { listStore } from "../stores/list.store";

const endOfFileContent = "\n" + "}\r" + "\n" + "\u0000";

export const saveToFile = () => {
  const { lines, filePathName, fontSize } = listStore;
  const { appContent, coloursLine } = resolveSaveContent(lines);

  resolveSaveColours(coloursLine);

  const fs = fontSize * 2;

  const _contentLinesBeforeContent = [
    "{\\rtf1\\ansi\\ansicpg1252\\deff0\\nouicompat\\deflang1033{\\fonttbl{\\f0\\fnil\\fcharset0 Calibri;}}",
    "{\\*\\generator Riched20 10.0.19041}\\viewkind4\\uc1 ",
    `\\pard\\sl240\\slmult1\\f0\\fs${fs}\\lang9\\par`
  ];

  if (coloursLine !== undefined) {
    _contentLinesBeforeContent.splice(1, 0, coloursLine);
  }

  const contentLinesBeforeContent = _contentLinesBeforeContent.join("\n");

  const content = contentLinesBeforeContent + " " + appContent + endOfFileContent;

  const saveToFile = new CustomEvent("saveToFile", {
    detail: { content, filePathName }
  });

  window.dispatchEvent(saveToFile);
};
