const { app, BrowserWindow } = require("electron");

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

fetch("http://127.0.0.1:5127/status")
  .then(r => r.json())
  .then(console.log);

app.whenReady().then(createWindow);