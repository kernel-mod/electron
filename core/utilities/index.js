/**
 * @module utilities
 */

import * as electron from "electron";

export /**
 * A universal context function for identifying the context your code is running in.
 * @returns {string("MAIN","PRELOAD","RENDERER")} The name of the current process.
 */ function processLocation() {
	if (!electron) {
		return "RENDERER";
	} else if (electron?.ipcMain) {
		return "MAIN";
	} else if (electron?.ipcRenderer) {
		return "PRELOAD";
	}
	return "UNKNOWN";
}

export /**
 * A function for the PRELOAD or RENDERER that injects a new separate module into the renderer.
 * @param {object} options
 * @param {string} options.path The path to the module.
 * @param {boolean} [options.sync=false] Whether to run synchronously or asynchronously.
 * @param {function} [options.onload=undefined] Code to run once the script has finished loading.
 */ async function injectRendererModule({ path, sync = false, onload }) {
	if (processLocation() === "MAIN") {
		throw new Error("No.");
	}

	const script = Object.assign(document.createElement("script"), {
		type: "module",
		async: (!sync).toString(),
		src: `import${sync ? "-sync" : ""}://${path}`,
	});
	if (onload) script.addEventListener("load", onload);
	while (!document.documentElement) {
		await new Promise((resolve) => setImmediate(resolve));
	}
	document.documentElement.appendChild(script);
	script.remove();
}
