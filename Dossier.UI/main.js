const { app, BrowserWindow } = require("electron");
const config = require("./config");

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

fetch(`${config.apiBase}/status`)
  .then(r => r.json())
  .then(console.log);

app.whenReady().then(createWindow);