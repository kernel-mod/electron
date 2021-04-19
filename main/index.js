const { app, protocol } = require("electron");
const { logger } = require("../core/global");

// Replace Electron's BrowserWindow with our own.
require("./injectBrowserWindow");

protocol.registerSchemesAsPrivileged([
	{ scheme: "esm", privileges: { bypassCSP: true } },
	{ scheme: "esm-sync", privileges: { bypassCSP: true } },
]);

app.on("ready", () => {
	// Set up IPC.
	require("./ipc");

	// Remove CSP.
	require("./removeCSP");

	// Add ESM Loader
	require("./esmLoader");

	// Start Discord.
	require("./startDiscord");
});
