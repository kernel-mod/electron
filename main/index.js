import logger from "kernel/logger";
import { app, protocol } from "electron";

logger.log("Loading Kernel.");

// Replace Electron's BrowserWindow with our own.
import("./injectBrowserWindow");

protocol.registerSchemesAsPrivileged([
	{ scheme: "esm", privileges: { bypassCSP: true } },
	{ scheme: "esm-sync", privileges: { bypassCSP: true } },
]);

app.on("ready", () => {
	// Set up IPC.
	require("./ipc");

	// Remove CSP.
	require("./removeCSP");

	// Add Renderer Loader
	require("../transpiler/rendererLoader");

	// Start Discord.
	require("./startDiscord");
});
