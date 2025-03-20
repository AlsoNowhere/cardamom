import { listStore } from "../../stores/list.store";

import { IStates } from "../../interfaces/IStates.interface";

export const resolveColours = (
  states: IStates,
  content: string,
  styles: Record<string, string>
) => {
  {
    let index = 1;
    // ** Font colour
    for (let colour of listStore.colours) {
      if (content.includes(`\\cf${index}`)) {
        states.setColour = colour;
      }
      if (states.setColour !== null) {
        styles.color = states.setColour;
      }
      index++;
    }
  }

  if (content.includes("\\cf0")) {
    states.setColour = null;
    content = content.replace(`\\cf0`, "");
  }

  {
    for (let index of listStore.colours.map((_, i) => i + 1)) {
      content = content.replace(`\\cf${index} `, "");
    }
  }

  return content;
};
