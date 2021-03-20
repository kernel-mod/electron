// Handles loading ESModules in the renderer process.

const babel = require("@babel/core");
const { protocol } = require("electron");
const fs = require("fs");
const path = require("path");
const { logger } = require("../core/global");

function plugin(pluginName) {
	return path.resolve(__dirname, "..", "node_modules", pluginName);
}

protocol.registerBufferProtocol("esm", (request, callback) => {
	let url = request.url.replace("esm://", "");

	if (!path.basename(url).includes(".")) url += ".js"; // TODO: handle directories and other file type loaders

	let result = fs.readFileSync(
		path.isAbsolute(url) ? url : path.join(__dirname, "..", url),
		"utf-8"
	);

	if (!result) callback({ status: 404 });

	// Transpile the result.
	try {
		const transpiled = babel.transformSync(result, {
			targets: {
				electron: process.versions.electron,
				esmodules: true,
			},
			// presets: [plugin("@babel/preset-env")],
		}).code;
		logger.log(transpiled);
		if (!transpiled) {
			throw "";
		}
		result = transpiled;
	} catch (e) {
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
