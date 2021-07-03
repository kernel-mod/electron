const babel = require("@babel/core");
const path = require("path");
const getModule = require("./getModule");
const hashCache = require("./hashCache");
const sourceMapsOptions = require("./sourceMapsOptions");

const targets = {
	electron: process.versions.electron,
	node: process.versions.node,
};

function generateBabelOptions(currentFile) {
	return {
		targets,
		...sourceMapsOptions(currentFile),
		presets: [
			[
				getModule("@babel/preset-env"),
				{
					targets,
				},
			],
			getModule("@babel/preset-react"),
		],
		plugins: [
			getModule("@babel/plugin-proposal-class-properties"),
			[
				getModule("babel-plugin-module-resolver"),
				{
					alias: {
						kernel: path.resolve(__dirname, "..", "core"),
					},
				},
			],
		],
	};
}

function sync(code, url) {
	return hashCache.sync(code, () => {
		return babel.transformSync(code, generateBabelOptions(url)).code;
	});
}
async function async(code, url) {
	return hashCache.async(code, async () => {
		return (await babel.transformAsync(code, generateBabelOptions(url))).code;
	});
}

module.exports = { generateBabelOptions, sync, async };
