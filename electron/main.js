const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const path = require("path");
const fileService = require("fs");
const { dialog } = require("electron");

Menu.setApplicationMenu(null);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    frame: false,
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "./preload.js"),
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile("./index.html");

  ipcMain.on("minimize", () => {
    mainWindow.minimize();
  });

  ipcMain.on("close", () => {
    mainWindow.close();
  });

  ipcMain.on("loadFile", async (event, defaultPath) => {
    const response = await dialog.showOpenDialog({
      properties: ["openFile"],
      defaultPath,
    });

    if (response === undefined || response.filePaths.length === 0) {
      event.sender.send("actionReply", {});
      return;
    }

    const {
      filePaths: [filePathName],
    } = response;
    const content = fileService.readFileSync(filePathName, "utf-8");
    event.sender.send("actionReply", { content, filePathName });
  });

  ipcMain.on("getFileContents", async (event, filePathName) => {
    const content = fileService.readFileSync(filePathName, "utf-8");
    event.sender.send("getFileReply", { content });
  });

  ipcMain.on("saveFile", async (_, { content, filePathName }) => {
    fileService.writeFileSync(filePathName, content);
  });

  /* Open the DevTools. */
  mainWindow.webContents.openDevTools();
}

app.on("ready", createWindow);

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ** These functions define the detection and action of a user opening a file directly
// ** from file explorer.
{
  app.whenReady().then(() => {
    const files = process.argv;
    mainWindow.webContents.send("appInitiateMain", { files });
  });

  // ** This check prevents more than one instance of the app being opened.
  if (!app.requestSingleInstanceLock()) {
    app.quit();
  }
  // ** Handle opening more than one file at a time.
  else {
    app.on("second-instance", (_, argv) => {
      const files = argv;
      mainWindow.webContents.send("appInitiateMain", { files });
    });
  }
}
