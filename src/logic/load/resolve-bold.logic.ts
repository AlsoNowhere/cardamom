import { IStates } from "../../interfaces/IStates.interface";

export const resolveBold = (
  states: IStates,
  content: string,
  styles: Record<string, string>
) => {
  if (states.isBold || content.includes("\\b")) {
    states.isBold = true;
    styles["font-weight"] = "bold";
  }
  if (content.includes("\\b0")) {
    states.isBold = false;
    content = content.replace(/\\b0/g, "");
  }

  content = content.replace(/\\b\s/g, "").replace(/\\b/g, "");

  return content;
};
