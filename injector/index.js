const { app, ipcMain } = require("electron");

module.exports = (injectionPath) => {
	app.on("ready", () => {
		require("./removeCSP");
	});
	require("./injectBrowserWindow");
	ipcMain.on("KERNEL_PRELOAD_DATA", (event) => {
		event.returnValue = event.sender.__NEXTDISCORD__;
	});
	require("./startDiscord")(injectionPath);
};
