import * as electron from 'electron';

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

export async function injectRendererModule({ path, sync = false, onload }) {
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
