const path = require("path");
const { BrowserWindow } = require("electron");

const preloadPath = path.join(__dirname, "../preload");

module.exports = class PatchedBrowserWindow extends BrowserWindow {
	constructor(options) {
		let originalPreload;
		let location;

		// Need some way to let packages control this.
		// Right now it's set up for Discord only.

		// This check is bad but it's the best I can think of right now.
		if (/Discord.*\.exe/.test(process.execPath)) {
			if (options.webContents) {
				/* Popouts /shrug */
				location = "POPOUT";
			} else if (options?.webPreferences?.nodeIntegration) {
				/* Splash Screen */
				/* This has no preload, so just override it. */
				options.webPreferences.preload = preloadPath;
				location = "SPLASH_SCREEN";
			} else if (options?.webPreferences?.offscreen) {
				/* Overlay */
				originalPreload = options.webPreferences.preload;
				opts.webPreferences.preload = preloadPath;
				location = "OVERLAY";
			} else if (options?.webPreferences?.preload) {
				originalPreload = options.webPreferences.preload;

				if (options.webPreferences.nativeWindowOpen) {
					/* Main Window */
					options.webPreferences.preload = preloadPath;
					location = "MAIN_WINDOW";
				} else {
					/* Old Splash Screen */
					/* For macOS and Windows. */
					// options.webPreferences.preload = preloadPath;
					location = "SPLASH_SCREEN";
				}
			}
		}

		// Any reason to have this off?
		options.webPreferences.experimentalFeatures = true;

		const window = new BrowserWindow(options);

		// Put the location and the original preload in a place the main IPC can easily reach.
		window.webContents.__KERNEL__ = { originalPreload, location };

		return window;
	}
};
