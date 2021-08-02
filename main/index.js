import logger from "kernel/logger";
import { app, protocol, ipcRenderer } from "electron";
import * as heart from "kernel/heart/main";

logger.time("Loaded in");

logger.log("Loading Kernel.");

protocol.registerSchemesAsPrivileged([
	{ scheme: "import", privileges: { bypassCSP: true } },
	{ scheme: "import-sync", privileges: { bypassCSP: true } },
]);

// Async to do async package stuff before loading client.
// Don't worry packages load faster than straight async, most can load bulk in sync.
(async () => {
	// Load main packages.
	const packageLoader = await import("../packageLoader");

	if (!app.commandLine.hasSwitch("kernel-safe-mode")) {
		logger.time("Retrieved packages in");
		const packages = packageLoader.getPackages();
		const ogre = packageLoader.getOgre(packages, packages);
		logger.timeEnd("Retrieved packages in");
		logger.time("Loaded packages in");
		await packageLoader.load(ogre, packages);
		logger.timeEnd("Loaded packages in");
	} else {
		logger.log("Running in safe mode. All packages are initially disabled.");
	}

	// Replace Electron's BrowserWindow with our own.
	await import("./patchBrowserWindow");

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
		]).then(async () => {
			logger.timeEnd("Loaded in");

			// Start Discord.
			await import("./startDiscord");
		});
	});
})();
