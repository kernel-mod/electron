// TODO: Also alias for renderer.

import path from "path";
import Module from "module";

export type PatchFunction = (moduleID: string) => any;
export type UnpatchFunction = () => boolean;

const originalRequire = Module.prototype.require;

export const patches: {
	[id: string]: PatchFunction;
} = {};

const patchedRequire: NodeJS.Require = Object.assign(function (
	...args: string[]
) {
	const moduleID = path.join(...args);

	for (const patchFunction of Object.values(patches)) {
		try {
			const ret = patchFunction(moduleID);
			if (ret != null) return ret;
		} catch (e) {
			console.error("Failed require patch:", e);
		}
	}

	return originalRequire.apply(this, arguments);
},
originalRequire);

Module.prototype.require = patchedRequire;

export function patch(
	id: string,
	patchFunction: PatchFunction
): UnpatchFunction {
	if (patches[id]) throw `Require patch "${id}" already exists.`;
	patches[id] = patchFunction;
	return () => unpatch(id);
}

export function unpatch(id: string): boolean {
	return delete patches[id];
}
