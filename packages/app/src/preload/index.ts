import { contextBridge, webUtils, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  async getContentOfFile(filePath: string) {
    return await ipcRenderer.invoke("getFileContent", filePath);
  },
  getPathOfFile(file: File) {
    return webUtils.getPathForFile(file);
  },
});