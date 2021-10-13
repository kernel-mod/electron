import loadedPackages from "./loadedPackages";

export default function _startPackage(packageID: string) {
	loadedPackages[packageID]?.instance?.start?.();
}
