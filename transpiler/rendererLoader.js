// Handles loading ESModules in the renderer process.

import { protocol } from "electron";
import * as fs from "fs";
import * as path from "path";
import logger from "kernel/logger";
import { default as async, sync } from './esmodules';

// DO NOT USE A TRY CATCH YOU WILL REGRET IT
protocol.registerBufferProtocol("esm-sync", (request, callback) => {
	let url = request.url.replace("esm-sync://", "");

	if (!path.basename(url).includes(".")) url += ".js"; // TODO: handle directories and other file type loaders

	let result = fs.readFileSync(
		path.isAbsolute(url) ? url : path.join(__dirname, "..", url),
		"utf-8"
	);

	if (!result) callback({ status: 404 });

	// Transpile the result.
	const transpiled = sync(result);
	if (transpiled) {
		result = transpiled;
	} else {
		logger.error(
			"Failed to transpile. Attempting to pass untranspiled result.",
			e
		);
	}

	callback({
		mimeType: "text/javascript",
		data: Buffer.from(result, "utf-8"),
	});
});

protocol.registerBufferProtocol("esm", async (request, callback) => {
	let url = request.url.replace("esm://", "");

	if (!path.basename(url).includes(".")) url += ".js"; // TODO: handle directories and other file type loaders

	let result = await fs.promises
		.readFile(
			path.isAbsolute(url) ? url : path.join(__dirname, "..", url),
			"utf-8"
		)
		.catch(() => callback({ status: 404 }));

	// Transpile the result.
	const transpiled = await async(result).catch(() => callback({ status: 404 }));
	if (transpiled) {
		result = transpiled;
	} else {
		logger.error(
			"Failed to transpile. Attempting to pass untranspiled result.",
			e
		);
	}

	callback({
		mimeType: "text/javascript",
		data: Buffer.from(result, "utf-8"),
	});
});
