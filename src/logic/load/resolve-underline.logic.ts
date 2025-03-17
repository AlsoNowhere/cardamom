import { IStates } from "../../interfaces/IStates.interface";

export const resolveUnderline = (
  states: IStates,
  content: string,
  styles: Record<string, string>
) => {
  if (states.isUnderline || content.includes("\\ul")) {
    states.isUnderline = true;
    styles["text-decoration"] = "underline";
  }
  if (content.includes("\\ulnone")) {
    states.isUnderline = false;
    content = content.replace(/\\ulnone/g, "");
  }
  content = content.replace(/\\ul\s/g, "").replace(/\\ul/g, "");
  return content;
};
