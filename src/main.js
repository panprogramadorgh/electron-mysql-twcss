const { BrowserWindow, Notification, ipcMain } = require("electron");
const { join } = require("path");

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    minWidth: 800,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: true,
      preload: join(__dirname, "ui/preload.js"),
    },
  });

  mainWindow.loadFile("./src/ui/index.html");

  // Exists the app when the mainWindow is closed
  mainWindow.on("close", () => {
    process.exit(0);
  });

  ipcMain.on("notification", (_, { title, body }) => {
    new Notification({
      title,
      body,
    }).show();
  });

  ipcMain.on("view-products", () => {
    const productsWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        preload: join(__dirname, "ui/preload.js"),
      },
    });
    productsWindow.loadFile("./src/ui/products.html");
  });
};

module.exports = { createWindow };
