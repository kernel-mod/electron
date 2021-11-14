import electron from "electron";
import path from "path";

console.log("Patching Electron's BrowserWindow.");

// Let's try to use Symbols as much as possible.
export const kernelPreloadDataSymbol = Symbol("kernelWindowData");

// export type PatchFunction = () => object;

// export const patches: {
// 	[id: string]: PatchFunction;
// } = {};

// export const originalBrowserWindow = electron.BrowserWindow;

const preloadPath = path.join(__dirname, "preload");

// Create a Proxy over Electron that returns the PatchedBrowserWindow if BrowserWindow is called.
// Can't just proxy the BrowserWindow class directly because it's a getter.
const electronProxy = new Proxy(electron, {
	get(electronTarget, property) {
		switch (property) {
			case "BrowserWindow":
			default:
				return electronTarget[property];
		}
	},
});

// Get the path to Electron to replace it.
// Even though we're in ESM this works because transpilation.
const electronPath = require.resolve("electron");
// Delete Electron from the require cache because it's a getter.
delete require.cache[electronPath].exports;
// Replace it with the new Electron Proxy.
require.cache[electronPath].exports = electronProxy;
