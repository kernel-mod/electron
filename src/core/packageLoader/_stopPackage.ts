import loadedPackages from "./loadedPackages";

export default function _stopPackage(packageID: string) {
	loadedPackages[packageID]?.instance?.stop?.();
}
