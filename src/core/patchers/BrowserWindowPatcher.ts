import electron from "electron";
import path from "path";
import { patch as patchElectron } from "./ElectronPatcher";

export type PatchFunction = (
	target: typeof electron.BrowserWindow,
	argArray: any[],
	newTarget: Function
) => object;
export type UnpatchFunction = () => boolean;

declare type KernelWebContents = electron.WebContents & {
	kernelWindowData?: {
		originalPreload: string;
		windowOptions: electron.BrowserViewConstructorOptions;
	}
}

export const patches: {
	[id: string]: PatchFunction;
} = {};

export const originalBrowserWindow = electron.BrowserWindow;

let BrowserWindowProxy = null;
const preloadPath = path.join(__dirname, "..", "..", "preload");

patchElectron("BrowserWindow", (target, property) => {
	if (property === "BrowserWindow") {
		// Create a Proxy over Electron that returns the PatchedBrowserWindow if BrowserWindow is called.
		// Can't just proxy the BrowserWindow class directly because it's a getter.
		BrowserWindowProxy ??= new Proxy(target.BrowserWindow, {
			construct(BrowserWindowTarget, args) {
				const [options, ...rest] = args;

				for (const [id, func] of Object.entries(patches)) {
					try {
						// @ts-ignore arguments is iterable.
						const override = func.apply(BrowserWindowTarget, arguments);
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
				const window = new BrowserWindowTarget(options, ...rest);

				// Put the location and the original preload in a place the main IPC can easily reach.
				// @ts-ignore
				(window.webContents as KernelWebContents).kernelWindowData = {
					originalPreload: originalPreload,
					windowOptions: options,
				};

				return window;
			},
		});

		return BrowserWindowProxy;
	}
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
