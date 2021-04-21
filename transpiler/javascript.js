const babel = require("@babel/core");
const path = require("path");
const getModule = require("./getModule");

module.exports = (code) => {
	return babel.transformSync(code, {
		presets: [
			[
				getModule("@babel/preset-env"),
				{
					targets: {
						electron: process.versions.electron,
					},
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
	}).code;
};
