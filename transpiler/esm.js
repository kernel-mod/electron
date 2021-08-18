import * as babel from "@babel/core";
import { resolvePath as _resolvePath } from "babel-plugin-module-resolver";
import * as path from "path";
import getModule from "./getModule.js";
import * as hashCache from "./hashCache.js";
import sourceMapsOptions from "./sourceMapsOptions.js";

export function generateBabelOptions(currentFile) {
	return {
		targets: {
			electron: process.versions.electron,
			esmodules: true,
		},
		...sourceMapsOptions(currentFile),
		presets: [
			[
				getModule("@babel/preset-env"),
				{
					modules: false,
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
					resolvePath(sourcePath, _, opts) {
						let resolved = _resolvePath(sourcePath, currentFile, opts);
						if (sourcePath.startsWith(".") || sourcePath.startsWith("/")) {
							resolved = path.resolve(path.dirname(currentFile), sourcePath);
						} else if (!resolved) {
							resolved = sourcePath;
						}
						return "import://" + resolved;
					},
					alias: {
						kernel: path.resolve(__dirname, "..", "core"),
					},
				},
			],
			getModule("babel-plugin-transform-commonjs"),
		],
	};
}

export default async function async(code, url) {
	return code;
}

export { async };

export function sync(code, url) {
	return code;
}
