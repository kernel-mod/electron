function uuid(dontMatch: (uuid: string) => boolean): string {
	let uuid: string;
	let failed = false;
	do {
		if (failed) console.count("You are astronomically unlucky.");
		uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
			const r = (Math.random() * 16) | 0;
			const v = c === "x" ? r : (r & 0x3) | 0x8;
			return v.toString(16);
		});
		failed = true;
	} while (dontMatch(uuid));
	return uuid;
}

function isObject(item: any): boolean {
	return item && typeof item === "object" && !Array.isArray(item);
}

function mergeDeep<Type extends object | any[]>(
	target: Type,
	source: Type
): Type {
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

function deepFreezeClone<Type extends object | any[]>(
	obj: Type
): Readonly<Type> {
	const frozen: object = Array.isArray(obj) ? [...obj] : { ...obj };
	for (const [key, value] of Object.entries(obj)) {
		if (typeof obj[key] === "object") {
			frozen[key] = deepFreezeClone(value);
			continue;
		}
		frozen[key] = value;
	}
	return Object.freeze(frozen as Type);
}

type AnyFunction = (...any: any) => any;

export type PatcherOptions = {
	insteadMerge?: boolean;
	afterMerge?: boolean;
};

export type ObjectPatch<FunctionType> = {
	id: string;
	patchedFunction: FunctionType;
	originalFunction: FunctionType;
	unpatch: Function;
};

export type FunctionPatch<FunctionType> = {
	patchedFunction: FunctionType;
	originalFunction: FunctionType;
};

// The functions should return either the original types or anything they want.
// ts-ignore should be used if the user wants to return something of a different type.
export type PatchFunctions<ObjectType, FunctionType extends AnyFunction> = {
	before?: ({
		that,
		args,
	}: {
		that?: ObjectType;
		args?: Parameters<FunctionType>;
	}) => Parameters<FunctionType>;
	instead?: ({
		that,
		args,
	}: {
		that: ObjectType;
		args: Parameters<FunctionType>;
	}) => ReturnType<FunctionType>;
	after?: ({
		that,
		args,
		ret,
	}: {
		that: ObjectType;
		args: Parameters<FunctionType>;
		ret: ReturnType<FunctionType>;
	}) => ReturnType<FunctionType>;
};

export type PatchStorageID = object & {
	unpatch?: () => void;
	before: AnyFunction[];
	instead: AnyFunction[];
	after: AnyFunction[];
};

// const globalPatches: {
// 	patches: Map<
// 		AnyFunction,
// 		{
// 			[id: string]: PatchStorageID;
// 		}
// 	>;
// 	originalPatched: Map<AnyFunction, AnyFunction>;
// 	patchedOriginal: Map<AnyFunction, AnyFunction>;
// } = {
// 	patches: new Map(),
// 	originalPatched: new Map(),
// 	patchedOriginal: new Map(),
// };

export default class Patcher {
	#patches: { [id: string]: PatchStorageID } = {};
	#options: PatcherOptions = {};

	static readonly patchesSymbol = Symbol("patchesSymbol");

	get patches() {
		// Idiot-proofing.
		return deepFreezeClone(this.#patches);
	}

	get options() {
		// Idiot-proofing.
		return deepFreezeClone(this.#options);
	}

	constructor(options: PatcherOptions = {}) {
		options.insteadMerge ??= true;
		options.afterMerge ??= true;
		Object.assign(this.#options, options);
	}

	// getGlobalPatches(id: string): PatchStorageID | undefined;
	// getGlobalPatches(func: AnyFunction, id: string): PatchStorageID | undefined;
	// getGlobalPatches(
	// 	func: string | AnyFunction,
	// 	id?: string
	// ): PatchStorageID | undefined {
	// 	switch (typeof func) {
	// 		case "string":
	// 			id = func;
	// 			for (const patchObject of globalPatches) {
	// 				if (patchObject.hasOwnProperty(id)) {
	// 					return patchObject[id];
	// 				}
	// 			}
	// 			break;
	// 		case "function":
	// 			return globalPatches.get(func as AnyFunction)?.patches[id];
	// 	}
	// }

	unpatch(id: string) {
		this.#patches[id]?.unpatch();
		delete this.#patches[id];
	}

	unpatchAll() {
		for (const id in this.#patches) {
			this.unpatch(id);
		}
	}

	patch<ObjectType extends object, FunctionName extends string>(
		id: string,
		object: object,
		functionName: string,
		// @ts-ignore ObjectType[FunctionName] is a function otherwise this just doesn't work.
		patches: PatchFunctions<ObjectType, ObjectType[FunctionName]>
		// @ts-ignore Same as above.
	): ObjectPatch<ObjectType[FunctionName]> {
		id = this.#ensureID(id);

		const patch = this.patchFunction(id, object[functionName], patches);

		object[functionName] = patch.patchedFunction;

		function unpatch() {
			object[functionName] = patch.originalFunction;
		}

		this.#patches[id].unpatch = unpatch;

		return {
			id,
			patchedFunction: patch.patchedFunction,
			originalFunction: patch.originalFunction,
			unpatch,
		};
	}

	patchFunction<FunctionType extends AnyFunction>(
		id: string,
		func: FunctionType,
		patchFunctions: PatchFunctions<ThisType<FunctionType>, FunctionType>
	): FunctionPatch<FunctionType> {
		id = this.#ensureID(id);

		let proxiedFunction: FunctionType;

		if (!Object.getOwnPropertySymbols(func).includes(Patcher.patchesSymbol)) {
			const patchIDs = new Set<string>([id]);
			// Save the this context for inside the Proxy.
			const patcher = this;

			if (!this.#patches.hasOwnProperty(id)) {
				this.#patches[id] = {
					before: [],
					instead: [],
					after: [],
				};
			}
			if (patchFunctions.hasOwnProperty("before"))
				this.#patches[id].before.push(patchFunctions.before);
			if (patchFunctions.hasOwnProperty("instead"))
				this.#patches[id].instead.push(patchFunctions.instead);
			if (patchFunctions.hasOwnProperty("after"))
				this.#patches[id].after.push(patchFunctions.after);

			proxiedFunction = new Proxy(func, {
				get(target, key, receiver) {
					switch (key) {
						case Patcher.patchesSymbol:
							return patchIDs;
						case "toString":
							return () => target.toString();
						default:
							return target[key];
					}
				},
				set(target, key, value, receiver) {
					switch (key) {
						default:
							target[key] = value;
					}
					return true;
				},
				apply(target, thisArg, argArray) {
					// Get all patches for all IDs.
					const registeredIDs = proxiedFunction[
						Patcher.patchesSymbol
					] as Set<string>;
					const patches = { before: [], instead: [], after: [] };
					for (const id of registeredIDs) {
						patches.before = patches.before.concat(patcher.#patches[id].before);
						patches.instead = patches.instead.concat(
							patcher.#patches[id].instead
						);
						patches.after = patches.after.concat(patcher.#patches[id].after);
					}

					let newArgs = argArray;

					for (const before of patches.before) {
						try {
							newArgs = before({
								that: thisArg,
								args: newArgs,
							});
						} catch (e) {
							console.error(`Failed "${id}" before patch:`, e);
						}
					}

					let result: any;
					let didInstead = false;
					for (const instead of patches.instead) {
						try {
							// Save the new result.
							const newResult = instead({
								that: thisArg,
								args: newArgs,
							});

							// Don't check for null because that means the user specified a return value.
							if (newResult !== undefined) {
								if (
									patcher.#options.insteadMerge &&
									isObject(newResult) &&
									isObject(result)
								) {
									// Attempt to combine them if they are both objects.
									// Make sure the option is enabled first, however.
									result = mergeDeep(result, newResult);
								}
								// Otherwise override it with the latest result.
								else {
									result = newResult;
								}
							}

							// It got to here so a instead patch was successful and there's no need to run the original function.
							didInstead = true;
						} catch (e) {
							console.error(`Failed "${id}" instead patch:`, e);
						}
					}
					// If there weren't any instead patches in the first place or that had successful runs, run the original function.
					if (!didInstead) {
						try {
							result = target.apply(thisArg, newArgs);
						} catch (e) {
							console.error(
								`Failed "${id}" original function with modified args:`,
								e
							);
							result = target.apply(thisArg, arguments);
						}
					}

					for (const after of patches.after) {
						try {
							const newResult = after({
								that: thisArg,
								args: newArgs,
								result,
							});

							// The same logic for the instead patch merging.
							if (newResult !== undefined) {
								if (
									patcher.#options.afterMerge &&
									isObject(newResult) &&
									isObject(result)
								) {
									result = mergeDeep(result, newResult);
								} else {
									result = newResult;
								}
							}
						} catch (e) {
							console.error(`Failed "${id}" after patch:`, e);
						}
					}
					return result;
				},
			});
		} else {
			(func[Patcher.patchesSymbol] as Set<String>).add(id);
			if (!this.#patches.hasOwnProperty(id)) {
				this.#patches[id] = {
					before: [],
					instead: [],
					after: [],
				};
			}
			if (patchFunctions.hasOwnProperty("before"))
				this.#patches[id].before.push(patchFunctions.before);
			if (patchFunctions.hasOwnProperty("instead"))
				this.#patches[id].instead.push(patchFunctions.instead);
			if (patchFunctions.hasOwnProperty("after"))
				this.#patches[id].after.push(patchFunctions.after);
		}

		return {
			patchedFunction: proxiedFunction ?? func,
			originalFunction:
				// @ts-ignore It definitely has the property.
				func ?? (proxiedFunction.originalFunction as FunctionType),
		};
	}

	#ensureID(id: string | undefined): string {
		if (id == null && this.#patches.hasOwnProperty(id)) {
			throw new Error(`Patch ID "${id}" already exists.`);
		}
		id ??= uuid((uuid) => this.#patches.hasOwnProperty(uuid));

		if (!this.#patches.hasOwnProperty(id)) {
			this.#patches[id] ??= { before: [], instead: [], after: [] };
		}

		return id;
	}
}
