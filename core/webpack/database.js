import { database } from ".";

let storage = {
	modules: {},
	properties: {},
	classProperties: {},
	stringified: {},
};

export function importModule(module, index) {
	if (
		~["object", "function"].indexOf(typeof module) &&
		Object.keys(module).length > 0 &&
		module !== window
	) {
		// Add modules to the main database.
		storage.modules[index] = module;

		// Index them by their property names.
		const properties = [
			...new Set([
				...Object.keys(module),
				...Object.keys(module.__proto__ ?? {}),
				...Object.keys(module.default ?? {}),
				...Object.keys(module.default?.__proto__ ?? {}),
			]),
		];
		for (const property of properties) {
			try {
				if (~["toString", "constructor", "valueOf"].indexOf(property)) continue;
				if (!storage.properties[property]) {
					storage.properties[property] = [];
				}
				storage.properties[property].push(index);
			} catch (e) {
				console.error(
					"Something has gona horribly wrong 2: Electric Boogaloo",
					e
				);
			}
		}

		// Index them by their CSS class names.
		const classProperties = Object.keys(module);
		if (
			classProperties.every(
				(property) =>
					typeof property === "string" &&
					/[A-Za-z0-9]-[A-Za-z0-9_-]{6}-?$/i.test(property)
			)
		) {
			for (const property of classProperties) {
				if (!storage.classProperties[property]) {
					storage.classProperties[property] = [];
				}
				storage.classProperties[property].push(index);
			}
		}

		// Index them by their stringified versions.
		function stringPush(moduleValue) {
			function stringIt(it) {
				if (it) {
					try {
						return it.toString([]);
					} catch (e) {
						return it.toString();
					}
				}
			}
			const string = stringIt(moduleValue);
			if (!storage.stringified[string]) {
				storage.stringified[string] = [];
			}
			storage.stringified[string].push(index);
		}
		if (typeof module === "function") {
			stringPush(module);
		}
		if (module.__esModule && module.default) {
			if (typeof module.default === "function") stringPush(module.default);
			if (typeof module.default.type === "function")
				stringPush(module.default.type);
		}

		return true;
	}
}

export { storage };
