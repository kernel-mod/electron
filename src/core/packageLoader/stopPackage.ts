import loadedPackages from "./getPackages";

export default function stopPackage(packageID: string) {
	if (loadedPackages[packageID]) {
		loadedPackages[packageID].instance.stop?.();
	}
}
