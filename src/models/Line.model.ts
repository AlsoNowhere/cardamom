import { styles as _styles } from "sage";

import { lineId } from "../data/constants.data";
import { variables } from "../data/variables.data";

export class Line {
  content: string;
  styles: Record<string, string>;
  id: number;

  getStyles: () => string;

  constructor(
    {
      content = "",
      styles = {},
      id,
    }: { content?: string; styles?: Record<string, string>; id?: number } = {
      content: "",
    }
  ) {
    this.content = content;
    this.styles = styles;

    if (id !== undefined) {
      this.id = id;
    } else {
      this.id = ++lineId.index;
    }

    this.getStyles = () => {
      return _styles({
        ...this.styles,
        "font-size": `${variables.fontSize}px`,
        "line-height": "calc(2em - 2px)",
      });
    };
  }
}
