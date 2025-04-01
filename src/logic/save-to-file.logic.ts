import { resolveSaveContent } from "./resolve-content.logic";

import { listStore } from "../stores/list.store";
import { resolveSaveColours } from "./save/resolve-colours.logic";

const endOfFileContent = "\n" + "}\r" + "\n" + "\u0000";

// const resolveFirstContentLine = (line: string, appContent: string) => {
//   // ** Remove an unneeded line break that might be added.
//   if (line.substring(line.length - 5) === "\\par\r") {
//     line = line.substring(0, line.length - 5);
//   }

//   // ** If there is no appContent then we don't need to add a space in.
//   line = appContent === "" ? line + "\n" : line + " " + appContent + "\n";

//   {
//     const lineStart = line.includes("{")
//       ? line.substring(0, line.lastIndexOf("}") + 1)
//       : "";
//     let lineEnd = line.includes("{")
//       ? line.substring(line.lastIndexOf("}") + 1, line.length)
//       : line;
//     let lineHeightSet = [false, false];
//     let fontSizeSet = false;
//     lineEnd = lineEnd
//       .split("\\")
//       .map((x) => {
//         if (line.charAt(0) !== "\\" || x.includes(" ")) return x;

//         if (x.substring(0, 2) === "sl" && x.length === 5) {
//           lineHeightSet[0] = true;
//           return "sl240";
//         }
//         if (x.substring(0, 7) === "slmulti") {
//           lineHeightSet[1] = true;
//           return x;
//         }
//         if (x.substring(0, 2) === "fs") {
//           fontSizeSet = true;
//           return "fs22";
//         }
//         return x;
//       })
//       .join("\\");
//     if (!lineHeightSet[1]) {
//       lineEnd = "\\slmulti" + lineEnd;
//     }
//     if (!lineHeightSet[0]) {
//       lineEnd = "\\sl240" + lineEnd;
//     }
//     if (!fontSizeSet) {
//       lineEnd = "\\fs22" + lineEnd;
//     }
//     line = lineStart + lineEnd;
//   }

//   return line;
// };

export const saveToFile = () => {
  const { appContent, coloursLine } = resolveSaveContent(listStore.lines);

  resolveSaveColours(coloursLine);

  // const contentLinesBeforeContent = listStore.contentFromFile
  //   .slice(0, -1)
  //   .join("\n");

  const _contentLinesBeforeContent = [
    "{\\rtf1\\ansi\\ansicpg1252\\deff0\\nouicompat\\deflang1033{\\fonttbl{\\f0\\fnil\\fcharset0 Calibri;}}",
    "{\\*\\generator Riched20 10.0.19041}\\viewkind4\\uc1 ",
    "\\pard\\sl240\\slmult1\\f0\\fs22\\lang9\\par",
  ];

  if (coloursLine !== undefined) {
    _contentLinesBeforeContent.splice(1, 0, coloursLine);
  }

  const contentLinesBeforeContent = _contentLinesBeforeContent.join("\n");

  // const firstLineWithContent = resolveFirstContentLine(
  //   listStore.contentFromFile.at(-1),
  //   appContent
  // );

  // const content =
  //   contentLinesBeforeContent + firstLineWithContent + endOfFileContent;

  const content =
    contentLinesBeforeContent + " " + appContent + endOfFileContent;

  // console.log(content);

  const saveToFile = new CustomEvent("saveToFile", {
    detail: { content, filePathName: listStore.filePathName },
  });

  window.dispatchEvent(saveToFile);
};
