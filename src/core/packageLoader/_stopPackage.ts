import loadedPackages from "./loadedPackages";

export default function _stopPackage(packageID: string) {
	try {
		loadedPackages[packageID]?.instance?.stop?.();
	} catch (e) {
		console.error(`Failed to stop package "${packageID}":`, e.message);
	}
}
