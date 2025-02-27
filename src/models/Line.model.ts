import { styles as _styles } from "sage";

import { lineId } from "../data/constants.data";

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
      return _styles(this.styles);
    };
  }
}
