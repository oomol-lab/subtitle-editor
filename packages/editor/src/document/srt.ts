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
        const [_, hours1, minutes1, seconds1, milliseconds1, hours2, minutes2, seconds2, milliseconds2] = match;
        begin = timestampToMilliseconds(hours1, minutes1, seconds1, milliseconds1);
        end = timestampToMilliseconds(hours2, minutes2, seconds2, milliseconds2);
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

function timestampToMilliseconds(hours: string, minutes: string, seconds: string, milliseconds: string): number {
  let sum: number = 0;
  sum += parseInt(hours, 10);
  sum *= 60;
  sum += parseInt(minutes, 10);
  sum *= 60;
  sum += parseInt(seconds, 10);
  sum *= 1000;
  sum += parseInt(milliseconds, 10);
  return sum;
}