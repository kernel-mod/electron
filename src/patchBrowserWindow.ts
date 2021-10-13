import electron from "electron";
import path from "path";

console.log("Patching Electron's BrowserWindow.");

const preloadPath = path.join(__dirname, "preload");

// Create a Proxy over Electron that returns the PatchedBrowserWindow if BrowserWindow is called.
// Can't just proxy the BrowserWindow class directly because it's a getter.
const electronProxy = new Proxy(electron, {
	get(electronTarget, property) {
		switch (property) {
			case "BrowserWindow":
				return new Proxy(electronTarget[property], {
					construct(BrowserWindowTarget, args) {
						const [options, ...rest] = args;

						// TODO: Need some way to let packages control this.
						const originalPreload = options.webPreferences.preload;

						options.webPreferences.preload = preloadPath;

						// Any reason to have this off?
						options.webPreferences.experimentalFeatures = true;

						// Keybase (dumb).
						options.webPreferences.devTools = true;

						// @ts-ignore
						const window = new BrowserWindowTarget(options, ...rest);

						// Put the location and the original preload in a place the main IPC can easily reach.
						// @ts-ignore
						window.webContents.kernelWindowData = {
							originalPreload: originalPreload,
							windowOptions: options,
						};

						window.webContents.openDevTools();

						return window;
					},
				});
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
