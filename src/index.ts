import { app, protocol } from "electron";
import * as path from "path";

console.time("Loaded in");

console.log("Loading Kernel.");

protocol.registerSchemesAsPrivileged([
	{ scheme: "import", privileges: { bypassCSP: true } },
	{
		scheme: "import-sync",
		privileges: { bypassCSP: true },
	},
]);

app.on("ready", () => {
	Promise.all([
		// Replace Electron's BrowserWindow with our own.
		import("./patchBrowserWindow"),
		// Set up IPC.
		import("./ipc"),
		// Remove CSP.
		import("./removeCSP"),
	]).then(async () => {
		// Async to do async package stuff before loading client.
		// Don't worry packages load faster than straight async, most can load bulk in sync.

		// Load main packages.
		// const packageLoader = await import("../packageLoader");

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
			console.log(url);
			callback({ path: url });
		});
		protocol.registerFileProtocol("import-sync", (request, callback) => {
			const url = request.url.substr(14);
			console.log(url);
			callback({ path: url });
		});

		console.timeEnd("Loaded in");

		// Start the app.
		await import("./startOriginal");
	});
});
