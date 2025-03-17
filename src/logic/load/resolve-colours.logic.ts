import { mainStore } from "../../stores/main.store";

import { IStates } from "../../interfaces/IStates.interface";

export const resolveColours = (
  states: IStates,
  content: string,
  styles: Record<string, string>
) => {
  {
    let index = 1;
    // ** Font colour
    for (let colour of mainStore.colours) {
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
    let index = 1;
    for (let item of mainStore.colours) {
      content = content.replace(`\\cf${index} `, "");
      index++;
    }
  }

  return content;
};
