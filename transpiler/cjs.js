const babel = require("@babel/core");
const path = require("path");
const getModule = require("./getModule");
const hashCache = require("./hashCache");

const targets = {
	electron: process.versions.electron,
	node: process.versions.node,
};

module.exports = (code) => {
	return hashCache.sync(code, babel.transformSync, code, {
		targets,
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
	});
};
