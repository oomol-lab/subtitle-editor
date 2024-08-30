import { load } from "js-yaml";
import { SrtLine, toSrtLines } from "srt-editor";
import { getExtName } from "./utils";

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