import loadedPackages from "./loadedPackages";

export default function _startPackage(packageID: string) {
    console.log("Starting package: " + packageID);

    if (loadedPackages.get(packageID)) {
        console.log("Loading package: " + loadedPackages.get(packageID));

        loadedPackages.get(packageID).instance?.start?.();
    }
}
