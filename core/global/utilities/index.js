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
		if (!module.exports.processLocation() === 'MAIN') throw new Error('no');
		if (!document.head) {
			await new Promise(ret => document.addEventListener('DOMContentLoaded', ret))
		}
		const s = document.createElement('script');
		s.type = 'module';
		s.async = true;
		s.src = `esm://${path}`;
		document.head.appendChild(s);
		s.remove();
	}
};
