import { dump, load } from "js-yaml";
import { SrtLine, toSrtFileContent, toSrtLines } from "srt-editor";

export async function parseSrtFilePath(path: string): Promise<SrtLine[]> {
  switch (getExtName(path).toLocaleLowerCase()) {
    case "srt": {
      const srtContent = await electronAPI.getContentOfFile(path);
      return toSrtLines(srtContent);
    }
    case "json": {
      const content = await electronAPI.getContentOfFile(path);
      return JSON.parse(content) as SrtLine[];
    }
    case "yaml":
    case "yml": {
      const content = await electronAPI.getContentOfFile(path);
      return load(content) as SrtLine[];
    }
    default: {
      throw new Error(`Unsupported file type: ${path}`);
    }
  }
}

export async function saveToFilePath(path: string, srtLines: SrtLine[]): Promise<void> {
  let fileContent = "";
  switch (getExtName(path).toLocaleLowerCase()) {
    case "srt": {
      fileContent = toSrtFileContent(srtLines);
      break;
    }
    case "json": {
      fileContent = JSON.stringify(srtLines, null, 2);
      break;
    }
    case "yaml":
    case "yml": {
      fileContent = dump(srtLines, { indent: 2 });
      break;
    }
    default: {
      throw new Error(`Unsupported file extension: ${path}`);
    }
  }
  await electronAPI.setFileContent(path, fileContent);
}

function getExtName(path: string): string {
  const pathCells = path.split(".");
  if (pathCells.length > 0) {
    return pathCells[pathCells.length - 1];
  } else {
    return "";
  }
}