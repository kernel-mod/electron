function isObject(item: object): boolean {
	return item && typeof item === "object" && !Array.isArray(item);
}

function mergeDeep(target: object, source: object): object {
	let output = Object.assign({}, target);
	if (isObject(target) && isObject(source)) {
		Object.keys(source).forEach((key) => {
			if (isObject(source[key])) {
				if (!(key in target)) Object.assign(output, { [key]: source[key] });
				else output[key] = mergeDeep(target[key], source[key]);
			} else {
				Object.assign(output, { [key]: source[key] });
			}
		});
	}
	return output;
}

function deepFreezeClone(obj: object | []) {
	const frozen: object = Array.isArray(obj) ? [...obj] : { ...obj };
	for (const [key, value] of Object.entries(obj)) {
		if (typeof obj[key] === "object") {
			frozen[key] = deepFreezeClone(value);
			continue;
		}
		frozen[key] = value;
	}
	return Object.freeze(frozen);
}

type BeforePatchFunction = (patchData: {
	that: any;
	args: any[];
	originalFunction: () => any;
}) => any;
type InsteadPatchFunction = BeforePatchFunction;
type AfterPatchFunction = (patchData: {
	that: any;
	args: any[];
	originalFunction: () => any;
	result: any;
}) => any;

interface BeforePatchFunctionObject {
	[functionName: string]: BeforePatchFunction;
}
interface InsteadPatchFunctionObject {
	[functionName: string]: InsteadPatchFunction;
}
interface AfterPatchFunctionObject {
	[functionName: string]: AfterPatchFunction;
}

interface Patch {
	object: object;
	originalFunction: () => any;
	before?: BeforePatchFunctionObject;
	instead?: InsteadPatchFunctionObject;
	after?: AfterPatchFunctionObject;
}

enum Types {
	BEFORE = "before",
	INSTEAD = "instead",
	AFTER = "after",
}

export default class Patcher {
	#patches: {
		[id: string]: Patch;
	} = {};

	get patches() {
		// Idiot-proofing.
		return deepFreezeClone(this.#patches);
	}

	static readonly Types = Types;

	unpatch(id: string): void {
		if (!this.#patches[id]) throw `No patch with ID "${id}" exists.`;
		for (const [functionName, { object, originalFunction }] of Object.entries(
			this.#patches[id]
		)) {
			// Remove the patches.
			for (const patchType of ["before", "instead", "after"]) {
				for (const patchToRemove of this.#patches[id][functionName][
					patchType
				]) {
					for (const patch of object[functionName].__patcher[patchType]) {
						if (patchToRemove === patch) {
							// Remove the patch from both storages.
							object[functionName].__patcher[patchType].splice(
								object[functionName].__patcher[patchType].indexOf(patch),
								1
							);
							this.#patches[id][functionName][patchType].splice(
								this.#patches[id][functionName][patchType].indexOf(patch),
								1
							);
						}
					}
				}
			}

			// If there are no more patches left restore the original function.
			if (
				!object[functionName].__patcher.before.length &&
				!object[functionName].__patcher.instead.length &&
				!object[functionName].__patcher.after.length
			) {
				object[functionName] = originalFunction;
			}

			// If there are no more patches left delete it from storage.
			if (
				!this.#patches[id][functionName].before.length &&
				!this.#patches[id][functionName].instead.length &&
				!this.#patches[id][functionName].after.length
			) {
				delete this.#patches[id][functionName];
			}
			// Delete the ID if there's nothing left.
			if (!Object.keys(this.#patches[id]).length) {
				delete this.#patches[id];
			}
		}
	}

	unpatchAll(): void {
		for (const id of Object.keys(this.#patches)) {
			try {
				this.unpatch(id);
			} catch (e) {
				console.error(`Failed to unpatch ${id}.`, e);
			}
		}
	}

	before({
		id,
		object,
		patches,
	}: {
		id: string;
		object: object;
		patches: BeforePatchFunctionObject;
	}): any {
		return this.patch({ id, object, before: patches });
	}
	instead({
		id,
		object,
		patches,
	}: {
		id: string;
		object: object;
		patches: InsteadPatchFunctionObject;
	}): any {
		return this.patch({ id, object, instead: patches });
	}
	after({
		id,
		object,
		patches,
	}: {
		id: string;
		object: object;
		patches: AfterPatchFunctionObject;
	}): any {
		return this.patch({ id, object, after: patches });
	}

	patch({
		id,
		object,
		before,
		instead,
		after,
	}: {
		id: string;
		object: object;
		before?: BeforePatchFunctionObject;
		instead?: BeforePatchFunctionObject;
		after?: BeforePatchFunctionObject;
	}) {
		if (this.#patches[id]) throw `Patch with ID "${id}" already exists.`;

		// Loop over the patches that were provided.
		for (const [patchName, patchData] of Object.entries(before ?? {})) {
			this.#appendPatch({
				id,
				patchName,
				patchData,
				object,
				type: Patcher.Types.BEFORE,
			});
		}
		for (const [patchName, patchData] of Object.entries(instead ?? {})) {
			this.#appendPatch({
				id,
				patchName,
				patchData,
				object,
				type: Patcher.Types.INSTEAD,
			});
		}
		for (const [patchName, patchData] of Object.entries(after ?? {})) {
			this.#appendPatch({
				id,
				patchName,
				patchData,
				object,
				type: Patcher.Types.AFTER,
			});
		}
	}

	#appendPatch({
		id,
		patchName,
		patchData,
		object,
		type,
	}: {
		id: string;
		patchName: string;
		patchData: BeforePatchFunction | InsteadPatchFunction | AfterPatchFunction;
		object: any;
		type: Types;
	}) {
		// If there is a patch that doesn't exist skip it.
		if (!object.hasOwnProperty(patchName)) {
			return void console.error(
				`Object does not have the property "${patchName}".`
			);
		}

		// Make a copy of the original function.
		const originalFunction = object[patchName];

		// This ID doesn't exist, so create it.
		// @ts-ignore
		if (!this.#patches.hasOwnProperty(id)) this.#patches[id] = {};

		// Save just enough data so it can be unpatched later.
		if (!this.#patches[id].hasOwnProperty(patchName)) {
			this.#patches[id][patchName] = {
				object,
				originalFunction,
				before: [],
				instead: [],
				after: [],
			};
		}
		this.#patches[id][patchName][type].push(patchData);

		// Set up the patch variable on the function.
		let applyPatch = false;
		if (!object[patchName].hasOwnProperty("__patcher")) {
			applyPatch = true;
			object[patchName].__patcher = {
				originalFunction,
				before: [],
				instead: [],
				after: [],
			};
		}
		// Save the patches provided to the function.
		object[patchName].__patcher[type].push(patchData);

		// Only apply the patched function if it hasn't already been applied.
		if (applyPatch) {
			// Using a Proxy lets the properties on the original function get passed through easily.
			object[patchName] = (...args: any) => {
				let newArgs = args;
				for (const before of object[patchName].__patcher.before) {
					try {
						newArgs = before({
							that: object,
							args: newArgs,
							originalFunction,
						});
					} catch (e) {
						console.error("Failed before patch.", e);
					}
				}

				let result: any;
				let didInstead = false;
				for (const instead of object[patchName].__patcher.instead) {
					try {
						// Save the new result.
						const newResult = instead({
							that: object,
							args: newArgs,
							originalFunction,
						});
						// Attempt to combine them if they are both objects.
						if (isObject(newResult) && isObject(result)) {
							result = mergeDeep(result, newResult);
						} else {
							// Otherwise override it with the latest result.
							result = newResult;
						}
						// It got to here so a instead patch was successful and there's no need to run the original function.
						didInstead = true;
					} catch (e) {
						console.error("Failed instead patch.", e);
					}
				}
				// If there weren't any instead patches in the first place or that had successful runs, run the original function.
				if (!didInstead || object[patchName].__patcher.instead.length === 0) {
					try {
						result = originalFunction.call(object, ...newArgs);
					} catch (e) {
						console.error("Failed original function with modified args.", e);
						result = originalFunction.call(object, ...args);
					}
				}

				for (const after of object[patchName].__patcher.after) {
					try {
						result = after({
							that: object,
							args: newArgs,
							result,
							originalFunction,
						});
					} catch (e) {
						console.error("Failed after patch.", e);
					}
				}

				return result;
			};

			// Reassign the props and function.toString().
			Object.assign(object[patchName], originalFunction);
			object[patchName].toString = (...args: any) =>
				originalFunction.toString.call(originalFunction, ...args);
		}
	}
}
