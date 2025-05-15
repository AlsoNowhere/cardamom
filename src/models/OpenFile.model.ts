import { Line } from "./Line.model";

export class OpenFile {
  filePathName: string;
  fileName: string;
  lines: Array<Line>;
  colours: Array<string>;
  fontSize: number;

  constructor(filePathName: string, lines: Array<Line>, colours: Array<string>, fontSize: number) {
    this.filePathName = filePathName;
    this.fileName = this.filePathName.split("\\").at(-1).split(".").at(0);
    this.lines = lines;
    this.colours = colours;
    this.fontSize = fontSize;
  }
}
