/**
 * @module utilities
 */

const electron = require("electron");
const path = require("path");

/**
 * A universal context function for identifying the context your code is running in.
 * @returns {string("MAIN","PRELOAD","RENDERER","UNKNOWN")|string} The name of the current process.
 * @returns {string} The name of the current process.
 */
export function processLocation() {
	if (!electron) {
		return "RENDERER";
	} else if (electron?.ipcMain) {
		return "MAIN";
	} else if (electron?.ipcRenderer) {
		return "PRELOAD";
	}
	return "UNKNOWN";
}

function resolve(url) {
	if (path.isAbsolute(url)) {
		url = require.resolve(url);
	} else {
		url = require.resolve(path.join(__dirname, "..", "..", url));
	}

	// url = URL.pathToFileURL(url).href;

	// TODO: Check for package.json and find the relative `module` path or use the `main` path as a backup.

	return url;
}

/**
 * A function for the PRELOAD that injects a new separate module into the renderer.
 * @param {object} options
 * @param {string} options.path The path to the module.
 * @param {boolean} [options.sync=false] Whether to run synchronously or asynchronously.
 * @param {function} [options.onload=undefined] Code to run once the script has finished loading.
 */
export async function injectRendererModule({ path, sync = false, onload }) {
	if (processLocation() !== "PRELOAD") {
		throw new Error("No.");
	}

	const script = Object.assign(document.createElement("script"), {
		type: "module",
		async: (!sync).toString(),
		src: `import${sync ? "-sync" : ""}://${resolve(path)}`,
	});
	if (onload) script.addEventListener("load", onload);
	while (!document.documentElement) {
		await new Promise((resolve) => setImmediate(resolve));
	}
	document.documentElement.appendChild(script);
	// script.remove();
}
