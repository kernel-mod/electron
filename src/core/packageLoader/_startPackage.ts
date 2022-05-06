import loadedPackages from "./loadedPackages";

export default function _startPackage(packageID: string) {
	try {
		loadedPackages[packageID]?.instance?.start?.();
	} catch (e) {
		console.error(`Failed to start package "${packageID}":`, e.message);
	}
}
