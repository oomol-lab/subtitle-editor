import { contextBridge, webUtils } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  getPathOfFile(file: File) {
    return webUtils.getPathForFile(file);
  },
});