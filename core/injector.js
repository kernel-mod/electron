// By Strencher

// import Logger from "kernel/logger";
/**@module Injector */

/**
 * @typedef InjectorOptions
 * @property {string} caller Caller for the injection, can be used multiple times.
 * @property {object|Function} module Module to inject into.
 * @property {string} method Method name to inject into, must be a property of {@property Module}
 */

/**
 * @typedef Injection
 * @property {object|function} module
 * @property {() => void} revert
 * @property {string} method
 * @property {function} originalMethod
 * @property {Array<InjectionChild>} children;
 */

/**
 * @typedef InjectionChild
 * @property {string} caller;
 * @property {(thisObject, params: any[], res) => any=} after;
 * @property {(thisObject, params: any[]) => any=} before;
 * @property {(types = ["all"]) => void} uninject;
 */

/**
 * All injections
 * @type {Array<Injection>}
 */
export const injections = [];

/**
 * Checks the arguments for the **inject** function.
 * @param {InjectorOptions} options
 * @returns {void}
 * @private Should only be used by the injector itself.
 */
export function validateOptions(options) {
	if (typeof options.caller !== "string")
		throw new Error("No caller for injection specified!");
	if (typeof options.module === "undefined")
		throw new Error("No module to injection specified!");
	if (typeof options.method === "undefined")
		throw new Error("No injection method specified!");
	if (typeof options.module[options.method] !== "function")
		throw new Error(
			`Method '${options.method}' appears to be '${typeof options.module[
				options.method
			]}' instead of 'function'!`
		);
	if (Object.isFrozen(options.module))
		throw new Error("Module appears to be readonly! Cannot injection into it.");
	if (!["before", "after"].some((opt) => typeof options[opt] === "function"))
		throw new Error("No inject type specified!");
}

/**
 * Injects into a module, pushes another inject into **{injections}**
 * @param {object|function} module The module to be injected
 * @param {string} method The name of any property in **{module}**
 * @returns {Injection}
 */
export function createInjection(module, method) {
	const originalMethod = module[method];
	const injection = {
		module,
		method,
		originalMethod: module[method],
		children: [],
		revert: () => {
			const index = injections.indexOf(injection);
			if (index < 0) return false;
			module[method] = originalMethod;
			injections.splice(index, 1);
		},
	};

	module[method] = function (...params) {
		if (!injection.children.length) {
			injection.revert();
			return originalMethod.apply(this, arguments);
		}

		const before = injection.children.filter(
			(child) => typeof child.before === "function" && !child.cancelBefore
		);
		const after = injection.children.filter(
			(child) => typeof child.after === "function" && !child.cancelAfter
		);
		let returnValue = params;

		for (const injection of before) {
			try {
				const tempReturn = injection.before(this, returnValue);
				if (Array.isArray(tempReturn)) returnValue = tempReturn;
			} catch (exception) {
				Logger.error(
					`Failed to run before injection for ${before.caller}:\n`,
					exception
				);
			}
		}

		if (Array.isArray(returnValue)) params = returnValue;

		returnValue = originalMethod.apply(this, params);

		for (const injection of after) {
			try {
				const tempReturn = injection.after(this, params, returnValue);
				if (typeof tempReturn !== "undefined") returnValue = tempReturn;
			} catch (exception) {
				Logger.error(
					`Failed to run after injection for ${after.caller}:\n`,
					exception
				);
			}
		}

		return returnValue;
	};
	Object.assign(module[method], {
		injection: {
			uninject: injection.revert,
			originalMethod,
		},
		toString: () => originalMethod.toString(),
	});
	injections.push(injection);

	return injection;
}

/**
 * Resolves already existing injections / creates new injections.
 * @param {InjectorOptions} options Options provided for the injection process.
 * @returns {Injection}
 */
export function resolveInjection(options) {
	const { module, method } = options;
	let injection = injections.find(
		(e) => Object.is(e.module, module) && Object.is(e.method, method)
	);
	if (!injection) {
		injection = createInjection(module, method);
	}

	return injection;
}

/**
 * Inject into any module that is the typeof Function|Object.
 * @param {InjectorOptions} options
 * @returns {void}
 * @example
 * ```js
 * import Injector from "kernel/injector";
 * import Logger from "kernel/logger";
 *
 * Injector.inject({
 *      caller: "kernel-mod",
 *      module: window.console,
 *      method: "warn",
 *      before: (thisObject, params, res) => {
 *          Logger.log("Patched message: ", params);
 *      }
 * });
 * ```
 */
export function inject(options) {
	validateOptions(options);

	const injection = resolveInjection(options);

	const child = {
		...options,
		uninject: (types = ["all"]) => {
			const index = injection.children.indexOf(child);
			if (index < 0) return false;
			const foundChild = injection.children[index];
			$loop: for (const type of types)
				switch (type) {
					case "before":
						foundChild.cancelBefore = true;
						continue $loop;
					case "after":
						foundChild.cancelAfter = true;
						continue $loop;
					case "all":
						injection.children.splice(index, 1);
						break $loop;
				}
			if (
				(foundChild.cancelAfter && !foundChild.before) ||
				(foundChild.cancelBefore && !foundChild.after)
			) {
				injection.children.splice(index, 1);
			}
		},
	};

	injection.children.push(child);

	return child.uninject;
}

/**
 * Collects all injections by the **{caller}**
 * @param {string} caller Caller for injection to be resolved.
 * @returns {InjectionChild[]}
 */
export function getInjectionsByCaller(caller) {
	let found = [];
	for (const injection of injections) {
		for (const child of injection.children) {
			if (Object.is(child.caller, caller)) found.push(child);
		}
	}

	return found;
}

/**
 * Reverts the injection into a module by caller and method names.
 * @param {string} caller Caller for the injections.
 * @param {"all" | "before" | "after"} types Injection types.
 * @returns {boolean}
 */
export function uninject(caller, types = ["all"]) {
	const injections = getInjectionsByCaller(caller);
	if (!injections.length) return false;

	for (const child of injections) child.uninject(types);
	return true;
}

/**
 * Creates a injector specific for the choosen caller.
 * @param {string} caller Caller to for injections.
 */
export function create(caller) {
	if (typeof caller !== "string")
		throw new Error(
			`Caller must be a string, but got ${typeof caller} instead.`
		);

	return {
		inject: (options) => inject(Object.assign({ caller }, options)),
		uninject: (types) => uninject(caller, types),
		getInjectionsByCaller: () => getInjectionsByCaller(caller),
	};
}

const Injector = {
	inject,
	uninject,
	validateOptions,
	injections,
};

export default Injector;
