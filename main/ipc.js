const { ipcMain } = require("electron");

// Set up the IPC to send the data from the InjectedBrowserWindow to the preload.
ipcMain.on("KERNEL_PRELOAD_DATA", (event) => {
	event.returnValue = event.sender.__NEXTDISCORD__;
});