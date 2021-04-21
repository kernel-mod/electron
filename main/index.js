import logger from "kernel/logger";
import { app, protocol } from "electron";

logger.log("Loading Kernel.");

// Replace Electron's BrowserWindow with our own.
require("./injectBrowserWindow");

protocol.registerSchemesAsPrivileged([
	{ scheme: "import", privileges: { bypassCSP: true } },
	{ scheme: "import-sync", privileges: { bypassCSP: true } },
]);

app.on("ready", () => {
	console.time("Loading Time")
	Promise.all([
		// Set up IPC.
		import("./ipc"),
		// Remove CSP.
		import("./removeCSP"),
		// Add Renderer Loader
		import("../transpiler/rendererLoader"),
	]).then(() => {
		console.timeEnd("Loading Time")
		// Start Discord.
		require("./startDiscord");
	});
});
