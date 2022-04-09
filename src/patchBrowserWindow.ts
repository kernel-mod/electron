import electron from "electron";
import path from "path";

console.log("Patching Electron's BrowserWindow.");

const preloadPath = path.join(__dirname, "preload");

// Extending the class does not work.
export const ProxiedBrowserWindow = new Proxy(electron.BrowserWindow, {
	construct(target, args) {
		const options: electron.BrowserWindowConstructorOptions = args[0];

		const originalPreload = options.webPreferences.preload;

		options.webPreferences.preload = preloadPath;

		// Any reason to have this off?
		options.webPreferences.experimentalFeatures = true;

		// Keybase (dumb).
		options.webPreferences.devTools = true;

		// TODO: Check for MS Teams compatibility.

		// @ts-ignore
		const window = new target(options);

		// Put the location and the original preload in a place the main IPC can easily reach.
		// @ts-ignore
		window.webContents.kernelWindowData = {
			originalPreload: originalPreload,
			windowOptions: options,
		};

		return window;
	},
});

// Get the path to Electron to replace it.
// Even though we're in ESM this works because transpilation.
const electronPath = require.resolve("electron");
// Delete Electron from the require cache because it's a getter.
delete require.cache[electronPath].exports;
// Replace it with the a new Electron that has the ProxiedBrowserWindow.
// TODO: Look at possible problems if getters aren't used.
require.cache[electronPath].exports = {
	...electron,
	BrowserWindow: ProxiedBrowserWindow,
};
