import { app, protocol } from "electron";
import { packageLoader } from "./core";

console.time("Loaded in");

console.log("Loading Kernel.");

protocol.registerSchemesAsPrivileged([
	{ scheme: "import", privileges: { bypassCSP: true } },
	{
		scheme: "import-sync",
		privileges: { bypassCSP: true },
	},
]);

packageLoader.loadPackages(packageLoader.getOgre());

// Replace Electron's BrowserWindow with our own.
require("./patchBrowserWindow");

app.on("ready", () => {
	// Set up IPC.
	require("./ipc");
	// Remove CSP.
	require("./removeCSP");
	// Async to do async package stuff before loading client.
	// Don't worry packages load faster than straight async, most can load bulk in sync.

	// if (!app.commandLine.hasSwitch("kernel-safe-mode")) {
	// 	console.time("Retrieved packages in");
	// 	const packages = packageLoader.getPackages();
	// 	const ogre = packageLoader.getOgre(packages, packages);
	// 	console.timeEnd("Retrieved packages in");
	// 	console.time("Loaded packages in");
	// 	await packageLoader.load(ogre, packages);
	// 	console.timeEnd("Loaded packages in");
	// } else {
	// 	console.log("Running in safe mode. All packages are initially disabled.");
	// }

	protocol.registerFileProtocol("import", (request, callback) => {
		const url = request.url.substr(9);
		callback({ path: url });
	});
	protocol.registerFileProtocol("import-sync", (request, callback) => {
		const url = request.url.substr(14);
		callback({ path: url });
	});

	console.timeEnd("Loaded in");
});

// Start the app.
// Run with require to make sure it doesn't await in main process because that can be bad.
require("./startOriginal");
