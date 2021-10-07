import { app, protocol } from "electron";
import * as packageLoader from "./core/packageLoader";

console.time("Loaded before app ready in");

console.log("Loading Kernel.");

protocol.registerSchemesAsPrivileged([
	{ scheme: "import", privileges: { bypassCSP: true } },
	{
		scheme: "import-sync",
		privileges: { bypassCSP: true },
	},
]);

packageLoader.loadPackages(packageLoader.getOgre(), false);

// Replace Electron's BrowserWindow with our own.
require("./patchBrowserWindow");

console.timeEnd("Loaded before app ready in");

app.on("ready", async () => {
	console.time("Loaded after app ready in");

	protocol.registerFileProtocol("import", (request, callback) => {
		const url = request.url.substr(9);
		callback({ path: url });
	});
	protocol.registerFileProtocol("import-sync", (request, callback) => {
		const url = request.url.substr(14);
		callback({ path: url });
	});

	await Promise.all([
		// Set up IPC.
		import("./ipc"),
		// Remove CSP.
		import("./removeCSP"),
	]).then(() => {
		console.timeEnd("Loaded after app ready in");
	});
});

// Start the app.
// Run with require to make sure it doesn't await in main process because that can be bad.
require("./startOriginal");
