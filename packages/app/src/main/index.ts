import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { fileURLToPath } from "url";
import { app, ipcMain, BrowserWindow, IpcMainInvokeEvent } from "electron";

function createWindow() {
  const appPath = join(fileURLToPath(import.meta.url), "..", "..", "..")
  const mainWindow = new BrowserWindow({
    width: 1600,
    height: 1500,
    webPreferences: {
      preload: join(appPath, "lib", "preload", "index.js"),
    },
  });
  mainWindow.loadFile(join(appPath, "lib", "browser", "index.html"));

  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools();
  }
}

async function getFileContent(_: IpcMainInvokeEvent, filePath: string): Promise<string> {
  return await readFile(filePath, "utf-8");
}

async function setFileContent(_: IpcMainInvokeEvent, filePath: string, fileContent: string): Promise<void> {
  return await writeFile(filePath, fileContent, "utf-8");
}

app.whenReady().then(() => {
  ipcMain.handle("getFileContent", getFileContent);
  ipcMain.handle("setFileContent", setFileContent);
  createWindow();
});

app.on("window-all-closed", () => {
  app.quit();
});