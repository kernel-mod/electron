// Handles loading ESModules in the renderer process.
// https://github.com/nodejs/node/issues/31710

import { protocol } from "electron";
import * as fs from "fs";
import * as path from "path";
import * as URL from "url";
import { Logger } from "kernel/logger";
import { default as async, sync } from "./esm";

const logger = new Logger({ labels: [{ name: "Renderer Loader" }] });

function resolve(url) {
	if (path.isAbsolute(url)) {
		url = require.resolve(url);
	} else {
		url = require.resolve(path.join(__dirname, "..", url));
	}

	// url = URL.pathToFileURL(url).href;

	// TODO: Check for package.json and find the relative `module` path or use the `main` path as a backup.

	return url.replace("file:///", "");
}

protocol.registerBufferProtocol("import-sync", (request, callback) => {
	let url = request.url.replace("import-sync://", "");

	try {
		url = resolve(url);

		let result = fs.readFileSync(url, "utf-8");

		if (!result) callback({ status: 404 });

		// Transpile the result.
		const transpiled = sync(result);
		if (transpiled) {
			result = transpiled;
		} else {
			logger.error(
				`Failed to transpile "${url}". Attempting to pass untranspiled result.`
			);
		}

		callback({
			mimeType: "text/javascript",
			data: Buffer.from(result, "utf-8"),
		});
	} catch (e) {
		logger.error(e);
		callback({ status: 404 });
	}
});

protocol.registerBufferProtocol("import", async (request, callback) => {
	let url = request.url.replace("import://", "");

	try {
		url = resolve(url);

		let result = await fs.promises
			.readFile(url, "utf-8")
			.catch(() => callback({ status: 404 }));

		// Transpile the result.
		const transpiled = await async(result).catch(() =>
			callback({ status: 404 })
		);
		if (transpiled) {
			result = transpiled;
		} else {
			logger.error(
				`Failed to transpile "${url}". Attempting to pass untranspiled result.`
			);
		}

		callback({
			mimeType: "text/javascript",
			data: Buffer.from(result, "utf-8"),
		});
	} catch (e) {
		logger.error(e);
		callback({ status: 404 });
	}
});
