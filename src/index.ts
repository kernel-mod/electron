import { app, protocol } from "electron";
import * as packageLoader from "./core/packageLoader";

console.time("Loaded before app ready in");

console.log("Loading Kernel.");

protocol.registerSchemesAsPrivileged([
	{ scheme: "kernel", privileges: { bypassCSP: true } },
	{
		scheme: "kernel-sync",
		privileges: { bypassCSP: true },
	},
]);

packageLoader.loadPackages(packageLoader.getOgre(), false);

// Replace Electron's BrowserWindow with our own.
require("./patchBrowserWindow");

console.timeEnd("Loaded before app ready in");

app.on("ready", async () => {
	console.time("Loaded after app ready in");

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
		console.timeEnd("Loaded after app ready in");
	});
});

// Start the app.
// Run with require to make sure it doesn't await in main process because that can be bad.
require("./startOriginal");
