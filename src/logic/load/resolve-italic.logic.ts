import { IStates } from "../../interfaces/IStates.interface";

export const resolveItalics = (
  states: IStates,
  content: string,
  styles: Record<string, string>
) => {
  if (states.isItalic || content.includes("\\i")) {
    states.isItalic = true;
    styles["font-style"] = "italic";
  }
  if (content.includes("\\i0")) {
    states.isItalic = false;
    content = content.replace(/\\i0/g, "");
  }
  content = content.replace(/\\i\s/g, "").replace(/\\i/g, "");
  return content;
};
