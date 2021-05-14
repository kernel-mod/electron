import { storage } from "./database";

export function getByProperties(...properties) {
	if (properties.length === 1) storage.properties[properties[0]] ?? [];
	const indexedProperties = [];
	for (const property of properties) {
		if (!storage.properties[property]) return [];
		indexedProperties.push(storage.properties[property]);
	}
	return indexedProperties.reduce((a, b) => a.filter((c) => ~b.indexOf(c)));
}
function getByProps() {}
getByProps = getByProperties;
export { getByProps };
