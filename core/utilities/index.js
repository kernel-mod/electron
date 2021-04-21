const electron = require?.("electron");

module.exports = class Utilities {
	static processLocation() {
		if (!electron) {
			return "RENDERER";
		} else if (electron?.ipcMain) {
			return "MAIN";
		} else if (electron?.ipcRenderer) {
			return "PRELOAD";
		}
		return "UNKNOWN";
	}

	static async injectRendererModule({ path, sync = false, onload }) {
		if (Utilities.processLocation() === "MAIN") {
			throw new Error("No.");
		}

		const script = Object.assign(document.createElement("script"), {
			type: "module",
			async: (!sync).toString(),
			src: `esm${sync ? "-sync" : ""}://${path}`,
		});
		if (onload) script.addEventListener("load", onload);
		while (!document.documentElement) {
			await new Promise((resolve) => setImmediate(resolve));
		}
		document.documentElement.appendChild(script);
		script.remove();
	}
}

if (!module) eval("export default module.exports;");