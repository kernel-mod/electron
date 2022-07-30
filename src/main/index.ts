// Set up the error window.
import makeErrorWindow from "#kernel/ui/ErrorWindow/index";
process.on("uncaughtException", function (error) {
	console.error(error);
	makeErrorWindow(error);
});

// Set up the require patch for aliases.
import "#kernel/core/makeAlias";

import Logger from "#kernel/core/Logger";

import { app } from "electron";
import initIPC from "./ipc";
import regiserProtocols from "./registerProtocols";
import startOriginal from "./startOriginal";

export default (options: { startOriginal?: boolean } = {}) => {
	options.startOriginal ??= false;

	Logger.time("Loaded before app ready in");

	Logger.log("Loading Kernel.");

	regiserProtocols();

	// packageLoader.loadPackages(packageLoader.getOgre(), false);

	app.on("ready", async () => {
		Logger.time("Loaded after app ready in");

		initIPC();

		Logger.timeEnd("Loaded after app ready in");
	});

	Logger.timeEnd("Loaded before app ready in");

	// Kernel is most likely being injected.
	if (options.startOriginal) {
		// Start the app.
		// Run with require to make sure it doesn't await in main process because that can be bad.
		startOriginal();
	}
};
