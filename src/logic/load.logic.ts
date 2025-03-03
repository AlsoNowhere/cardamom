import { mainStore } from "../stores/main.store";

import { Line } from "../models/Line.model";

import { lineId, storage_key } from "../data/constants.data";
import { variables } from "../data/variables.data";

const resolveData = (lines: Array<any>) => {
  const output: Array<Line> = [];

  for (let line of lines) {
    const newLine = new Line(line);
    output.push(newLine);
  }

  return output;
};

export const loadData = () => {
  const data =
    localStorage.getItem(storage_key) ?? JSON.stringify({ lines: [{}] });

  const parsed: { lines: Array<any>; lineIndex: number; fontSize: number } =
    JSON.parse(data);

  const lines = resolveData(parsed.lines);

  mainStore.lines = lines;

  if (!!parsed.lineIndex) {
    lineId.index = parsed.lineIndex;
  }

  variables.fontSize = parsed.fontSize ?? 16;
};
