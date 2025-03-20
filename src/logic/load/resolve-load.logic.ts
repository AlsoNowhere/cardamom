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
  };

  for (let line of lines) {
    const styles: Record<string, string> = {};
    let content = line;

    // ** Paragraph
    content = content.replace(/\\par/g, "");

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

    output.push(
      new Line({
        content,
        styles,
      })
    );
  }
  return output;
};
