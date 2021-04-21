import * as babel from "@babel/core";
import * as path from "path";
import getModule from "./getModule";

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
					kernel: path.resolve(__dirname, "..", "core"),
				},
			},
		],
		getModule("babel-plugin-transform-commonjs"),
	],
};

export default async function asyncTranspile(code) {
	return babel.transformAsync(code, babelOptions).then((r) => r.code);
}

export function sync(code) {
	return babel.transformSync(code, babelOptions).code;
}
