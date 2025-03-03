import { TMintContent } from "mint";

export class Option {
  icon?: string;
  label?: string;
  class?: string;
  title: string;
  content?: TMintContent;
  action: () => void;

  constructor(args: {
    icon?: string;
    label?: string;
    class?: string;
    title: string;
    content?: TMintContent;
    action: () => void;
  }) {
    const { icon, label, title, content, action } = args;

    if (icon) {
      this.icon = icon;
    }

    if (label) {
      this.label = label;
    }

    if (args.class) {
      this.class = `${args.class} margin-right-small`;
    } else {
      this.class = "margin-right-small margin-bottom-small";
    }

    this.title = title;

    if (content) {
      this.content = content;
    }

    this.action = action;
  }
}
