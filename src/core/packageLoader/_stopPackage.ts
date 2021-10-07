import loadedPackages from "./loadedPackages";

export default function _stopPackage(packageID: string) {
	if (loadedPackages.get(packageID)) {
		loadedPackages.get(packageID).instance?.stop?.();
	}
}
