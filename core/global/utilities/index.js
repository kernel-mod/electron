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

	static async injectRendererModule(path) {
		if (module.exports.processLocation() !== "PRELOAD") {
			throw new Error("no");
		}

		while (!document.documentElement) {
			await new Promise((resolve) => setImmediate(() => resolve()));
		}

		const script = Object.assign(document.createElement("script"), {
			type: "module",
			async: "true",
			src: `esm://${path}`,
		});
		document.documentElement.appendChild(script);
		script.remove();
	}
};
