import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";

export default (error: Error) => {
	app.on("ready", () => {
		const errorWindow = new BrowserWindow({
			width: 800,
			height: 600,
			alwaysOnTop: true,
			show: false,
			autoHideMenuBar: true,
			webPreferences: {
				preload: path.join(__dirname, "ui", "ErrorWindow", "preload.js"),
			},
		});

		errorWindow.loadFile(
			path.join(__dirname, "ui", "ErrorWindow", "index.html")
		);

		errorWindow.webContents.on("did-finish-load", () => {
			errorWindow.webContents.send("KERNEL_ERROR", error.stack);
			errorWindow.show();
		});
	});
};
