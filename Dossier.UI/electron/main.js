import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow()
{
    const window = new BrowserWindow({
        width: 1440,
        height: 900,
        icon: path.join(__dirname, "assets/icon.png"),

        webPreferences: {
            preload: path.join(
                __dirname,
                "preload.js"
            )
        }
    });

    window.maximize();

    window.loadURL(
        "http://localhost:5173"
    );
}

ipcMain.handle(
    "select-folder",
    async () => {
        const result = await dialog.showOpenDialog({
            properties: [
                "openDirectory"
            ]
        });

        if (result.canceled)
            return null;

        return result.filePaths[0];
    }
);

app.whenReady().then(() => {
    createWindow();
});