import { changeStyle } from "./common/change-style.logic";

export const changeColour = (colour: string) => () => {
  changeStyle("color", colour);
};
