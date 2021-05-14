import logger from "kernel/logger";
import { app, protocol } from "electron";
import {
	open as openInspector,
	waitForDebugger as inspectorWaitForDebugger,
} from "inspector";

logger.time("Loaded in");

openInspector();
if (app.commandLine.hasSwitch("kernel-inspect-wait")) {
	logger.log("Waiting for debugger...");
	inspectorWaitForDebugger();
	logger.log("Connected to debugger.");
}

logger.log("Loading Kernel.");

// Replace Electron's BrowserWindow with our own.
require("./injectBrowserWindow");

protocol.registerSchemesAsPrivileged([
	{ scheme: "import", privileges: { bypassCSP: true } },
	{ scheme: "import-sync", privileges: { bypassCSP: true } },
]);

app.on("ready", () => {
	Promise.all([
		// Set up heart.
		import("kernel/heart/main"),
		// Set up IPC.
		import("./ipc"),
		// Remove CSP.
		import("./removeCSP"),
		// Add Renderer Loader
		import("../transpiler/rendererLoader"),
	]).then(() => {
		logger.timeEnd("Loaded in");

		// Start Discord.
		require("./startDiscord");

		// setTimeout(() => {
		// 	const heart = require("kernel/heart/main");
		// 	heart.beat({ vein: "TEST", data: "yoooo" });
		// }, 5e3);
	});
});
