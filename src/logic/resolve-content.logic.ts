import { Line } from "../models/Line.model";

export const resolveColours = (colours?: string) => {
  const output: Array<string> = [];
  if (colours === undefined) return output;

  const parts = colours.split(";");

  parts.forEach((colour, index) => {
    if (index === 0 || index === parts.length - 1) return;
    const _colour = `rgb(${colour
      .replace(/[a-z]/g, "")
      .replace(/(?!^)[\\]/g, ", ")
      .replace(/\\/g, "")})`;
    output.push(_colour);
  });

  return output;
};

export const resolvefirstContent = (firstLineWithContent) => {
  const parts = firstLineWithContent.split("\\");

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

const getColours = (colours: Array<string>) => {
  return colours
    .map((x) => {
      const [r, g, b] = x.replace("rgb(", "").replace(/[)\s]/g, "").split(",");
      return `\\red${r}\\green${g}\\blue${b}`;
    })
    .join(";");
};

export const resolveSaveContent = (lines: Array<Line>) => {
  const colours: Array<string> = [];

  const appContent = lines
    .map(({ content, styles }) => {
      if (styles["font-weight"] === "bold") {
        content = "\\b " + content + "\\b0";
      }
      if (styles["font-style"] === "italic") {
        content = "\\i " + content + "\\i0";
      }
      if (styles["text-decoration"] === "underline") {
        content = "\\ul " + content + "\\ulnone";
      }
      if (styles["color"] !== undefined) {
        const colour = styles["color"];
        const colourIndex = colours.findIndex((x) => x === colour);
        if (colourIndex !== -1) {
          content = `\\cf${colourIndex + 1} ${content}\\cf0`;
        } else {
          colours.push(colour);
          const colourIndex = colours.length - 1;
          content = `\\cf${colourIndex + 1} ${content}\\cf0`;
        }
      }
      return `${content}\\par`;
    })
    .join("\n");

  return {
    appContent,
    coloursLine:
      colours.length === 0
        ? undefined
        : `{\\colortbl ;${getColours(colours)};}`,
  };
};
