import * as babel from "@babel/core";
import * as path from "path";
import getModule from "./getModule";
import hashCacheBabel from "./hashCacheBabel";

export const babelOptions = {
	targets: {
		electron: process.versions.electron,
		esmodules: true,
	},
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
				alias: {
					kernel: "import://" + path.resolve(__dirname, "..", "core"),
					node: "import://" + path.resolve(__dirname, "..", "node_modules"),
				},
			},
		],
		getModule("babel-plugin-transform-commonjs"),
	],
};

export default async function async(code) {
	return hashCacheBabel.async(code, babel.transformAsync, code, babelOptions);
}

export { async };

export function sync(code) {
	return hashCacheBabel.sync(code, babel.transformSync, code, babelOptions);
}
