import { contextBridge, ipcRenderer, webUtils } from "electron";

const prefix = __DEV__ ? "/@fs" : "";

contextBridge.exposeInMainWorld("electronAPI", {
  async getContentOfFile(filePath: string) {
    return await ipcRenderer.invoke("getContentOfFile", filePath.slice(prefix.length));
  },
  async setFileContent(filePath: string, fileContent: string) {
    return await ipcRenderer.invoke("setFileContent", filePath.slice(prefix.length), fileContent);
  },
  getPathOfFile(file: File) {
    return `${prefix}${webUtils.getPathForFile(file)}`;
  },
});
