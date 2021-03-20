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

	static async injectRendererModule(path, sync = false) {
		if (module.exports.processLocation() === "MAIN") {
			throw new Error("No.");
		}

		while (!document.documentElement) {
			await new Promise((resolve) => setImmediate(() => resolve()));
		}

		const script = Object.assign(document.createElement("script"), {
			type: "module",
			async: (!sync).toString(),
			src: `esm${sync ? "-sync" : ""}://${path}`,
		});
		document.documentElement.appendChild(script);
		script.remove();
	}
};
