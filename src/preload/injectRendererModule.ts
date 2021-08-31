import fs from "fs-extra";
import * as crypto from "crypto";
import * as path from "path";

import resolve from "./resolve";

const cachePath = path.join(__dirname, "..", "..", "temp", "renderer");

/**
 * A function for the PRELOAD that injects a new separate module into the renderer.
 * @param {object} options
 * @param {string} options.path The path to the module.
 * @param {boolean} [options.sync=false] Whether to run synchronously or asynchronously.
 * @param {function} [options.onload=undefined] Code to run once the script has finished loading.
 */
export default async function injectRendererModule({
	script,
	sync = false,
	onload,
}: {
	script: string;
	sync?: boolean;
	onload?: () => void;
}) {
	const scriptElement = Object.assign(document.createElement("script"), {
		type: "module",
		async: (!sync).toString(),
		src: `import${sync ? "-sync" : ""}://${resolve(script)}`,
	});
	// TODO: Figure out why TS doesn't like this.
	// @ts-ignore
	if (onload) scriptElement.addEventListener("load", onload);
	while (!document.documentElement) {
		await new Promise((resolve) => setImmediate(resolve));
	}
	document.documentElement.appendChild(scriptElement);
	// @ts-ignore
	scriptElement.remove();
}
