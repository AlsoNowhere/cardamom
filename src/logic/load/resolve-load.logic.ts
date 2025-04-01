import { resolveBold } from "./resolve-bold.logic";
import { resolveItalics } from "./resolve-italic.logic";
import { resolveUnderline } from "./resolve-underline.logic";
import { resolveColours } from "./resolve-colours.logic";
import { resolveLink } from "./resolve-link.logic";
import { resolveOther } from "./resolve-other.logic";

import { Line } from "../../models/Line.model";

import { IStates } from "../../interfaces/IStates.interface";

export const resovleLoadContent = (lines: Array<string>) => {
  const output: Array<Line> = [];

  const states: IStates = {
    isBold: false,
    isItalic: false,
    isUnderline: false,
    setColour: null,

    // reset() {
    //   this.isBold = false;
    //   this.isItalic = false;
    //   this.isUnderline = false;
    //   this.setColour = null;
    // },
  };

  for (let line of lines) {
    let styles: Record<string, string> = {};
    let content = line;

    // ** Paragraph
    content = content.replace(/\\pard/g, "");
    content = content.replace(/\\par/g, "");

    // ** Line break
    content = content.replace(/\r/g, " ");

    // ** Links
    content = resolveLink(content);

    // ** Bold
    content = resolveBold(states, content, styles);

    // ** Italic
    content = resolveItalics(states, content, styles);

    // ** Underline
    content = resolveUnderline(states, content, styles);

    // ** Colours
    content = resolveColours(states, content, styles);

    // ** Other things resolved, like tab indents
    content = resolveOther(content);

    // ** Remove content that is just one space (an output from one of the above).
    if (content === " ") {
      content = "";
    }

    // ** There is no point defining styles on content that is missing.
    if (content === "") {
      styles = {};
    }

    output.push(
      new Line({
        content,
        styles,
      })
    );
  }
  return output;
};
