import { storage } from "./database";
import { getByProperties as getCommonModulesByProperties } from "./commonModules";

export /**
 * Wraps a filter to make it error safe.
 * @returns {Object} The safe filter.
 */ function wrapFilter(filter) {
	return (module) => {
		try {
			return filter(module);
		} catch {}
	};
}

export function getByFilter(filter) {
	for (const module of Object.values(storage.modules)) {
		if (filter(module)) return module;
	}
	return null;
}
export function getAllByFilter(filter) {
	let found = [];
	for (const module of Object.values(storage.modules)) {
		if (filter(module)) found.push(module);
	}
	return found;
}

export function getAllByStringExpression(expression) {
	const found = [];
	for (const [string, moduleIndex] of Object.entries(storage.stringified)) {
		if (wrapFilter(expression)(string)) found.push(getByIndex(moduleIndex));
	}
	return found;
}
export function getAllByStrings(...strings) {
	return getAllByStringExpression((string) =>
		strings.every((searchString) => ~string.indexOf(searchString))
	);
}
export function getAllByString(string) {
	return getAllByStrings(string);
}

export function getByStringExpression(expression) {
	for (const [string, moduleIndex] of Object.entries(storage.stringified)) {
		if (wrapFilter(expression)(string)) return getByIndex(moduleIndex);
	}
	return null;
}
export function getByStrings(...strings) {
	return getByStringExpression((string) =>
		strings.every((searchString) => ~string.indexOf(searchString))
	);
}
export function getByString(string) {
	return getByStrings(string);
}

export function getByDisplayName(displayName) {
	for (const reactComponent of storage.reactComponents) {
		if (reactComponent.displayName === displayName) return reactComponent;
	}
}

export function getByIndex(id) {
	return storage.modules[id];
}

export function getAllByProperties(...properties) {
	const commonModules = getCommonModulesByProperties(...properties);
	if (commonModules.length === 0) return null;
	return commonModules.map((moduleIndex) => storage.modules[moduleIndex]);
}
function getAllByProps() {}
getAllByProps = getAllByProperties;
export { getAllByProps };

export function getByProperties(...properties) {
	const commonModules = getCommonModulesByProperties(...properties);
	if (commonModules.length === 0) return null;
	return storage.modules[commonModules[0]];
}
function getByProps() {}
getByProps = getByProperties;
export { getByProps };