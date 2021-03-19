const { app } = require("electron");
const { logger } = require("../core/global");

// Replace Electron's BrowserWindow with our own.
require("./injectBrowserWindow");

require("./ipc");

app.on("ready", () => {
	// Remove CSP.
	require("./removeCSP");

	// Start Discord.
	require("./startDiscord");
});
