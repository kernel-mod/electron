import electron from "electron";
import memoize from "./memoize";

/**
 * A universal context function for identifying the context your code is running in.
 * @returns {string("MAIN","PRELOAD","RENDERER","UNKNOWN")|string} The name of the current process.
 * @returns {string} The name of the current process.
 */
function processLocation(): "MAIN" | "PRELOAD" | "RENDERER" | "UNKNOWN" {
	if (!electron) {
		return "RENDERER";
	} else if (electron?.ipcMain) {
		return "MAIN";
	} else if (electron?.ipcRenderer) {
		return "PRELOAD";
	}
	return "UNKNOWN";
}

export default memoize(processLocation);
