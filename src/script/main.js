const { app, BrowserWindow } = require('electron');
const path = require('path');

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    backgroundColor: "#141414",
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      webSecurity: true,
      nodeIntegration: true
    }
  });

  const indexPath = path.resolve(__dirname, '../index.html')
  mainWindow.loadFile(indexPath);
})
