import { SrtLine } from "./srtLine";

export function toSrtLines(srtFile: string): SrtLine[] {
    const srtLines: SrtLine[] = [];

    let begin: number = 0;
    let end: number = 0;
    let isText = false;

    for (let line of srtFile.split("\n")) {
      line = line.trim();
      if (line === "") {
        continue;
      }
      if (isText) {
        srtLines.push({ begin, end, text: line });
        isText = false;
      } else {
        const match = line.match(/^(\d+):(\d+):(\d+),(\d+) --> (\d+):(\d+):(\d+),(\d+)$/);
        if (match) {
          begin = parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseInt(match[3]) + parseInt(match[4]);
          end = parseInt(match[5]) * 3600 + parseInt(match[6]) * 60 + parseInt(match[7]) + parseInt(match[8]);
          isText = true;
        }
      }
    }
    return srtLines;
}

export function toSrtFileContent(srtLines: SrtLine[]): string {
  const lines: string[] = [];
  for (const { begin, end, text } of srtLines) {
    const beginTimestamp = millisecondsToTimestamp(begin);
    const endTimestamp = millisecondsToTimestamp(end);
    lines.push(
      `${beginTimestamp} --> ${endTimestamp}`,
      text,
      "",
    );
  }
  return lines.join("\n");
}

function millisecondsToTimestamp(milliseconds: number): string {
  const hours = Math.floor(milliseconds / 3600).toString().padStart(2, "0");
  const minutes = Math.floor((milliseconds % 3600) / 60).toString().padStart(2, "0");
  const seconds = (milliseconds % 60).toString().padStart(2, "0");
  const ms = (milliseconds % 1).toFixed(3).slice(2).padStart(3, "0");
  return `${hours}:${minutes}:${seconds},${ms}`;
}