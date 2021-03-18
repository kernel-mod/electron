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
};
