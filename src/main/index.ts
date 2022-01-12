// Set up the require patch for aliases.
import "./alias";

import { app } from "electron";
import * as packageLoader from "#kernel/core/packageLoader";
import "#kernel/core/patchers/BrowserWindowPatcher";
import Logger from "#kernel/core/Logger";

export default (options: { startOriginal?: boolean } = {}) => {
	options.startOriginal ??= false;

	Logger.time("Loaded before app ready in");

	Logger.log("Loading Kernel.");

	require("./registerProtocols");

	packageLoader.loadPackages(packageLoader.getOgre(), false);

	app.on("ready", async () => {
		Logger.time("Loaded after app ready in");

		await Promise.all([
			// Set up IPC.
			import("./ipc"),
			// Remove CSP.
			import("./removeCSP"),
		]).then(() => {
			Logger.timeEnd("Loaded after app ready in");
		});
	});

	Logger.timeEnd("Loaded before app ready in");

	// Kernel is most likely being injected.
	if (options.startOriginal) {
		// Start the app.
		// Run with require to make sure it doesn't await in main process because that can be bad.
		require("./startOriginal");
	}
};
