import { storage } from "kernel/webpack/database";

export function getByProperties(...properties) {
	const indexedProperties = [];
	for (const property of properties) {
		if (!storage.properties[property]) return null;
		indexedProperties.push(storage.properties[property]);
	}
	return indexedProperties.reduce((a, b) => a.filter((c) => ~b.indexOf(c)));
}
function getByProps() {}
getByProps = getByProperties;
export { getByProps };
