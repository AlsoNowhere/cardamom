import { mainStore } from "../stores/main.store";

import { Line } from "../models/Line.model";

export const resolveColours = (colours?: string) => {
  if (colours === undefined) return;
  const parts = colours.split(";");
  parts.forEach((colour, index) => {
    if (index === 0 || index === parts.length - 1) return;

    mainStore.colours[index] = `rgb(${colour
      .replace("\\", "")
      .replace(/[a-z]/g, "")
      .replace(/\\/g, ", ")})`;
  });
};

export const resolveLine3 = (line3) => {
  const parts = line3.split("\\");

  const newParts = parts.reduce((a, b) => {
    if (b.slice(0, 2) === "sa") return a;
    if (b.slice(0, 2) === "sl" && b.length === 5) a.push("sl240");
    else {
      a.push(b);
    }
    return a;
  }, [] as Array<string>);

  return newParts.join("\\");
};

export const resovleLoadContent = (lines: Array<string>) => {
  const output: Array<Line> = [];
  let isBold = false;
  let setColour = null;
  for (let line of lines) {
    const styles: Record<string, string> = {};
    let content = line;

    // ** Paragraph
    content = content.replace(/\\par/g, "");

    // ** Bold
    if (isBold || content.includes("\\b")) {
      isBold = true;
      styles["font-weight"] = "bold";
    }

    if (content.includes("\\b0")) {
      isBold = false;
      content = content.replace(/\\b0/g, "");
    }

    content = content.replace(/\\b\s/g, "");

    // ** Font colour
    for (let [index, colour] of Object.entries(mainStore.colours)) {
      if (content.includes(`\\cf${index}`)) {
        setColour = colour;
      }
      if (setColour !== null) {
        styles.color = setColour;
      }
    }

    if (content.includes("\\cf0")) {
      setColour = null;
      content = content.replace(`\\cf0`, "");
    }

    for (let [index] of Object.entries(mainStore.colours)) {
      content = content.replace(`\\cf${index} `, "");
    }

    output.push(
      new Line({
        content,
        styles,
      })
    );
  }
  return output;
};

export const resolveSaveContent = (lines: Array<Line>) => {
  return lines
    .map(({ content, styles }) => {
      // if (content === "") return content;
      if (styles["font-weight"] === "bold") {
        content = "\\b " + content + "\\b0";
      }
      return `${content}\\par`;
    })
    .join("\n");
};
