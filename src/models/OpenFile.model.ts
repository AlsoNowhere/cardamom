import { Line } from "./Line.model";

export class OpenFile {
  filePathName: string;
  fileName: string;
  lines: Array<Line>;
  colours: Array<string>;

  constructor(filePathName: string, lines: Array<Line>, colours: Array<string>) {
    this.filePathName = filePathName;
    this.fileName = this.filePathName.split("\\").at(-1).split(".").at(0);
    this.lines = lines;
    this.colours = colours;
  }
}
