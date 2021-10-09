import loadedPackages from "./loadedPackages";

export default function _startPackage(packageID: string) {

    if (loadedPackages.get(packageID)) {
        loadedPackages.get(packageID).instance?.start?.();
    }
}
