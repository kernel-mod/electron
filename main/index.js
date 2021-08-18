export const load = async (electron) => {
	electron.protocol.registerSchemesAsPrivileged([
		{ scheme: "import", privileges: { bypassCSP: true } },
		{ scheme: "import-sync", privileges: { bypassCSP: true } },
	]);
	console.log(process.versions, electron.app.isReady());
};

// import logger from "#kernel/logger";

// logger.time("Loaded in");
// logger.log("Loading Kernel.");

// // // Before ready.

// const { app } = require("electron");

// console.log(app.isReady());

// // Load main packages.
// // const packageLoader = require("../packageLoader");

// // if (!app.commandLine.hasSwitch("kernel-safe-mode")) {
// // 	console.time("Retrieved packages in");
// // 	const packages = packageLoader.getPackages();
// // 	const ogre = packageLoader.getOgre(packages, packages);
// // 	console.timeEnd("Retrieved packages in");
// // 	console.time("Loaded packages in");
// // 	packageLoader.load(ogre, packages).then(() => {
// // 		console.timeEnd("Loaded packages in");
// // 	});
// // } else {
// // 	console.log("Running in safe mode. All packages are initially disabled.");
// // }

// // Replace Electron's BrowserWindow with our own.
// require("./patchBrowserWindow.js");

// After ready EVEN THOUGH IT'S ALWAYS READY RDECTFYGUHIJOKPGHHUTFYIUHJIOK
// app.whenReady().then(async () => {
// 	await Promise.all([
// 		// Set up heart.
// 		// import("kernel/heart/main"),
// 		// Set up IPC.
// 		import("./ipc.js"),
// 		// Remove CSP.
// 		import("./removeCSP.js"),
// 		// Add Renderer Loader
// 		// import("../transpiler/rendererLoader.js"),
// 	]);
// 	logger.timeEnd("Loaded in");

// 	// Start Discord.
// 	await import("./startDiscord.js");
// });
