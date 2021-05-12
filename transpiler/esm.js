import * as babel from "@babel/core";
import { resolvePath as _resolvePath } from 'babel-plugin-module-resolver';
import * as path from "path";
import getModule from "./getModule";
import hashCache from "./hashCache";

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
				resolvePath(sourcePath, currentFile, opts) {
					let resolved = _resolvePath(sourcePath, currentFile, opts)
					if (!resolved && (sourcePath.startsWith(".") || sourcePath.startsWith("/"))) {
						resolved = path.resolve(path.dirname(currentFile), sourcePath)
					} else if (!resolved) {
						resolved = sourcePath;
					}
					if (!currentFile) return "import://" + resolved
					return "import://" + resolved + "?parent=" + encodeURIComponent(currentFile);
				},
				alias: {
					"kernel": path.resolve(__dirname, "..", "core"),
					// node: "import://" + path.resolve(__dirname, "..", "node_modules"), // this works, but only for node modules with no dependencies
					// "*": "" // like this maybe??
					// import fdh from "node/Buffer";
					// but if Buffer imports something it'll be imported like this
					// import fhdj from "someDep-thingy";
					// theres no alias so it fails
					// so we need to manually transpile after babel to this
					// import fhdj from "import://./someDep-thingy";
					// that way it uses the already working relative paths
					// there might be something for that, but im not sure

					// back OOF

					// specifically we need something that turns
					// import fhdj from "someDep-thingy";
					// into
					// import fhdj from "import://./someDep-thingy";
					// but ignores
					// import fhdj from "./someDep-thingy";

					// not sure
				},
			},
		],
		getModule("babel-plugin-transform-commonjs"),
	],
};

export default async function async(code, parent) {
	return hashCache.async(code, babel.transformAsync, code, {...babelOptions, filename: parent, cwd: path.dirname(parent)});
}

export { async };

export function sync(code, parent) {
	return hashCache.sync(code, babel.transformSync, code, {...babelOptions, filename: parent, cwd: path.dirname(parent)});
}

// this file does basically the same thing, but made for the renderer
// in the renderer we use the esmodules support that is built into chrome. yeah
// so here we transpile cjs into esm
