const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const config = require("./config");

ipcMain.handle("select-folder", async () => {
    const result = await dialog.showOpenDialog({
        properties: ["openDirectory"]
    });

    if (result.canceled) return null;
    return result.filePaths[0];
});

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: __dirname + "/preload.js"
        }
    });

    win.loadFile("index.html");
}

app.whenReady().then(createWindow);