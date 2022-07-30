import electron, { BrowserWindow } from "electron";
import path from "path";
import Logger from "../Logger";

export type PatchFunction = (
	target: typeof electron.BrowserWindow,
	argArray: any[],
	newTarget: Function
) => object;
export type UnpatchFunction = () => boolean;

export const patches: {
	[id: string]: PatchFunction;
} = {};

export const originalBrowserWindow = BrowserWindow;

const preloadPath = path.join(__dirname, "..", "..", "preload", "index.js");

Logger.log("Preload path:", preloadPath);

// Extending the class does not work.
export const ProxiedBrowserWindow = new Proxy(electron.BrowserWindow, {
	construct(target, args) {
		const options: electron.BrowserWindowConstructorOptions = args[0];

		for (const [id, func] of Object.entries(patches)) {
			try {
				const override = func.call(target, options);
				if (override != null) return override;
			} catch (e) {
				console.error(`Failed to patch ${id}:`, e);
			}
		}

		const originalPreload = options.webPreferences.preload;

		options.webPreferences.preload = preloadPath;

		// Any reason to have this off?
		options.webPreferences.experimentalFeatures = true;

		// Keybase (dumb).
		options.webPreferences.devTools = true;

		// TODO: Check for MS Teams compatibility.

		// @ts-ignore
		const window: BrowserWindow = new target(options);

		window.webContents.openDevTools({ mode: "detach" });

		// Put the location and the original preload in a place the main IPC can easily reach.
		// @ts-ignore
		window.webContents.kernelWindowData = {
			originalPreload: originalPreload,
			windowOptions: options,
		};

		return window;
	},
});

export function patch(
	id: string,
	patchFunction: PatchFunction
): UnpatchFunction {
	if (patches[id]) throw `BrowserWindow patch "${id}" already exists.`;
	patches[id] = patchFunction;
	return () => unpatch(id);
}

export function unpatch(id: string): boolean {
	return delete patches[id];
}

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
