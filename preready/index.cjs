const { app, protocol } = require("electron");

protocol.registerSchemesAsPrivileged([
	{ scheme: "import", privileges: { bypassCSP: true } },
	{ scheme: "import-sync", privileges: { bypassCSP: true } },
]);

// TODO: Load main packages.
// const packageLoader = require("../packageLoader");

// if (!app.commandLine.hasSwitch("kernel-safe-mode")) {
// 	console.time("Retrieved packages in");
// 	const packages = packageLoader.getPackages();
// 	const ogre = packageLoader.getOgre(packages, packages);
// 	console.timeEnd("Retrieved packages in");
// 	console.time("Loaded packages in");
// 	packageLoader.load(ogre, packages).then(() => {
// 		console.timeEnd("Loaded packages in");
// 	});
// } else {
// 	console.log("Running in safe mode. All packages are initially disabled.");
// }

// Replace Electron's BrowserWindow with our own.
require("./patchBrowserWindow.cjs");
