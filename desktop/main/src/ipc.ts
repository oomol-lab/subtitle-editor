import type { IpcMainInvokeEvent } from "electron";
import { readFile, writeFile } from "node:fs/promises";
import { ipcMain } from "electron";

type ElectronAPI = Omit<typeof electronAPI, "getPathOfFile">;
type HandleAPI = {
  [k in keyof ElectronAPI]: (event: IpcMainInvokeEvent, ...args: Parameters<ElectronAPI[k]>) => ReturnType<ElectronAPI[k]>
};

const handle: HandleAPI = {
  async getContentOfFile(_: IpcMainInvokeEvent, filePath: string): Promise<string> {
    return await readFile(filePath, "utf-8");
  },
  async setFileContent(_: IpcMainInvokeEvent, filePath: string, fileContent: string): Promise<void> {
    return await writeFile(filePath, fileContent, "utf-8");
  },
};

export const registerIpcHandlers = () => {
  Object.keys(handle).forEach((key) => {
    ipcMain.handle(key, handle[key as keyof ElectronAPI]);
  });
};
