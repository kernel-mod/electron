// const logger = require("#kernel/logger");
const electron = require("electron");
const PatchedBrowserWindow = require("./PatchedBrowserWindow.cjs");

// logger.log("Injecting into Electron's BrowserWindow.");

// Create a Proxy over Electron that returns the InjectedBrowserWindow if BrowserWindow is called.
const electronExports = new Proxy(electron, {
	get(target, prop) {
		if (prop === "BrowserWindow") {
			return PatchedBrowserWindow;
		}
		return target[prop];
	},
});

// Get the path to Electron to replace it.
// Even though we're in ESM this works because transpilation.
const electronPath = require.resolve("electron");
// Delete Electron from the require cache.
delete require.cache[electronPath].exports;
// Replace it with the new Electron Proxy.
require.cache[electronPath].exports = electronExports;

// the same, but fake esm is slow because transpiler

// alright, seeya. gn
