const { app } = require("electron");
const { createWindow } = require("./main.js");
const electronReload = require("electron-reload");

require("./database.js"); // <-- En caso de que falten variables de entorno deberia fallar

// Connecting to database
electronReload(__dirname);

app.whenReady().then(() => {
  createWindow();
});
