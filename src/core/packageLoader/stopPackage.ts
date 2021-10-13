import broadcast from "../broadcast";
import loadedPackages from "./loadedPackages";
import _stopPackage from "./_stopPackage";

broadcast.on("stopPackage", (packageID: string) => {
	_stopPackage(packageID);
});

export default function stopPackage(packageID: string) {
	const pack = loadedPackages[packageID];
	if (pack.enabled) {
		loadedPackages[packageID] = {
			...pack,
			enabled: false,
		};
		broadcast.emit("stopPackage", packageID);
	}
}
