// Handles loading ESModules in the renderer process.

import babel from "@babel/core";
import { protocol } from "electron";
import fs from "fs";
import path from "path";
import logger from "kernel/logger";
import getModule from "../transpiler/getModule";

const babelOptions = {
	targets: {
		electron: process.versions.electron,
		esmodules: true,
	},
	plugins: [getModule("@babel/plugin-proposal-class-properties")],
};

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
	const transpiled = babel.transformSync(result, babelOptions).code;
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
	const transpiled = (
		await babel
			.transformAsync(result, babelOptions)
			.catch(() => callback({ status: 404 }))
	)?.code;
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
