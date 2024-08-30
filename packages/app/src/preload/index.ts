import { contextBridge, webUtils, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  async getContentOfFile(filePath: string) {
    return await ipcRenderer.invoke("getFileContent", filePath);
  },
  async setFileContent(filePath: string, fileContent: string) {
    return await ipcRenderer.invoke("setFileContent", filePath, fileContent);
  },
  getPathOfFile(file: File) {
    return webUtils.getPathForFile(file);
  },
});