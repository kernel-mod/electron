import fs from "fs";
import Module from "module";

export type PatchFunction = <Stringify extends boolean>(
	moduleID: string,
	stringify: Stringify
) => Stringify extends true ? string : any;
export type UnpatchFunction = () => boolean;

const originalRequire = Module.prototype.require;

export const patches: {
	[id: string]: PatchFunction;
} = {};

export const patchedRequire: PatchFunction = Object.assign(function (
	moduleID,
	stringify
) {
	for (const patchFunction of Object.values(patches)) {
		try {
			const ret = patchFunction(moduleID, stringify);
			if (ret != null) return ret;
		} catch (e) {
			console.error("Failed require patch:", e);
		}
	}

	if (stringify) return fs.readFileSync(require.resolve(moduleID));
	return originalRequire.apply(this, arguments);
},
originalRequire);

// @ts-ignore
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
