// Set up the require patch for aliases.
import "./alias";

import { app, protocol } from "electron";
import * as packageLoader from "#kernel/core/packageLoader";
import BrowserWindowPatcher from "#kernel/core/patchers/BrowserWindowPatcher";
import Logger from "#kernel/core/Logger";

export default ({ startOriginal = true }: { startOriginal?: boolean } = {}) => {
	Logger.time("Loaded before app ready in");

	Logger.log("Loading Kernel.");

	// Register the protocol schemes.
	protocol.registerSchemesAsPrivileged([
		{ scheme: "kernel", privileges: { bypassCSP: true } },
		{
			scheme: "kernel-sync",
			privileges: { bypassCSP: true },
		},
	]);

	packageLoader.loadPackages(packageLoader.getOgre(), false);

	// Replace Electron's BrowserWindow with our own.
	BrowserWindowPatcher;

	app.on("ready", async () => {
		Logger.time("Loaded after app ready in");

		// TODO: Move to a separate file, add aliases here as well.
		protocol.registerFileProtocol("kernel", (request, callback) => {
			const url = request.url.substr(8);
			callback({ path: url });
		});
		protocol.registerFileProtocol("kernel-sync", (request, callback) => {
			const url = request.url.substr(12);
			callback({ path: url });
		});

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
	if (startOriginal) {
		// Start the app.
		// Run with require to make sure it doesn't await in main process because that can be bad.
		require("./startOriginal");
	}
};
