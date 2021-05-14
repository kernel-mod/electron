// Handles loading ESModules in the renderer process.
// https://github.com/nodejs/node/issues/31710

import { protocol } from "electron";
import * as fs from "fs";
import { Logger } from "kernel/logger";
import { default as async, sync } from "./esm";

const logger = new Logger({ labels: [{ name: "Renderer Loader" }] });

function resolve(url) {
	return require.resolve(url).replace("file:///", "");
}

protocol.registerBufferProtocol("import-sync", (request, callback) => {
	let url = request.url.replace("import-sync://", "");

	try {
		url = resolve(url);

		let result = fs.readFileSync(url, "utf-8");

		if (!result) callback({ status: 404 });

		// Transpile the result.
		const transpiled = sync(result, url);
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
		const transpiled = await async(result, url).catch((e) => {
			logger.error(
				`Failed to transpile "${url}". Attempting to pass untranspiled result.\nError: ${e}`
			);
		});
		if (transpiled) {
			result = transpiled;
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
