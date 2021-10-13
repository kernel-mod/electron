import broadcast from "../broadcast";
import loadedPackages from "./loadedPackages";
import _startPackage from "./_startPackage";

broadcast.on("startPackage", (packageID: string) => {
	_startPackage(packageID);
});

export default function startPackage(packageID: string) {
	const pack = loadedPackages[packageID];
	if (!pack.enabled) {
		loadedPackages[packageID] = {
			...pack,
			enabled: true,
		};
		broadcast.emit("startPackage", packageID);
	}
}
