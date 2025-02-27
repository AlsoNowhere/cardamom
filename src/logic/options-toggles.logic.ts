import { changeStyle } from "./common/change-style.logic";

export const toggleBold = () => {
  changeStyle("font-weight", "bold", true);
};

export const toggleItalic = () => {
  changeStyle("font-style", "italic", true);
};

export const toggleUnderline = () => {
  changeStyle("text-decoration", "underline", true);
};
