import resolve from "../../preload/resolve";

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
	const scriptElement: HTMLScriptElement = Object.assign(
		document.createElement("script"),
		{
			type: "module",
			src: `kernel${sync ? "-sync" : ""}://${resolve(script)}`,
		}
	);
	if (!sync) {
		scriptElement.setAttribute("async", "true");
	}

	if (onload) scriptElement.addEventListener("load", onload);
	while (!document.documentElement) {
		await new Promise((resolve) => setImmediate(resolve));
	}

	document.documentElement.appendChild(scriptElement);
	// scriptElement.remove();
}
