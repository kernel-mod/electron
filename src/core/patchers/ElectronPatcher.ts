import electron from "electron";
import path from "path";

// Let's try to use Symbols as much as possible.
export const kernelPreloadDataSymbol = Symbol("kernelWindowData");

export type PatchFunction = (
	target: typeof electron,
	p: string | symbol,
	receiver: any
) => object | undefined;
export type UnpatchFunction = () => boolean;

export const patches: {
	[id: string]: PatchFunction;
} = {};

// export const originalBrowserWindow = electron.BrowserWindow;

const preloadPath = path.join(__dirname, "preload");

// Create a Proxy over Electron that returns the PatchedBrowserWindow if BrowserWindow is called.
// Can't just proxy the BrowserWindow class directly because it's a getter.
const electronProxy = new Proxy(electron, {
	get(target, property) {
		for (const [id, func] of Object.entries(patches)) {
			try {
				// @ts-ignore arguments is iterable.
				const override = func.apply(target, arguments);
				if (override != null) return override;
			} catch (e) {
				console.error(`Failed to patch ${id}:`, e);
			}
		}
		return target[property];
	},
});

export function patch(
	id: string,
	patchFunction: PatchFunction
): UnpatchFunction {
	if (patches[id]) throw `Electron patch "${id}" already exists.`;
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
// Replace it with the new Electron Proxy.
require.cache[electronPath].exports = electronProxy;
