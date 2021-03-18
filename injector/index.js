const { app, ipcMain } = require("electron");

// Remove CSP as soon as the app is ready.
app.on("ready", () => {
	require("./removeCSP");
});
// Replace Electron's BrowserWindow with our own.
require("./injectBrowserWindow");
// Set up the IPC to send the data from the InjectedBrowserWindow to the preload.
ipcMain.on("KERNEL_PRELOAD_DATA", (event) => {
	event.returnValue = event.sender.__NEXTDISCORD__;
});
// Start Discord.
require("./startDiscord");
