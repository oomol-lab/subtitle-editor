import { join } from "path";
import { fileURLToPath } from "url";
import { app, BrowserWindow } from "electron";

function createWindow() {
  const appPath = join(fileURLToPath(import.meta.url), "..", "..", "..")
  const mainWindow = new BrowserWindow({
    width: 1300,
    height: 1500,
  });
  mainWindow.loadFile(join(appPath, "lib", "browser", "index.html"));
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();
});

app.on("window-all-closed", () => {
  app.quit();
});