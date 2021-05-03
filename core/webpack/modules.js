import { storage } from "kernel/webpack/database";
import { getByProperties as getCommonModulesByProperties } from "kernel/webpack/commonModules";

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
