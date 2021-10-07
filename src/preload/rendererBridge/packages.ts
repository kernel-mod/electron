import * as packageLoader from "../../core/packageLoader";
import broadcast from "../../core/broadcast";

export default {
	getPackages(): {
		[id: string]: packageLoader.PackageInfo;
	} {
		return packageLoader.getPackages();
	},
	getOgre(packages: {
		[id: string]: packageLoader.PackageInfo;
	}): packageLoader.Ogre {
		// Hot.
		packages ??= packageLoader.getPackages();
		return packageLoader.getOgre(packages);
	},
	startPackage(packageID: string) {
		broadcast.emit("startPackage", packageID);
	},
	stopPackage(packageID: string) {
		broadcast.emit("stopPackage", packageID);
	},
	events: {
		on(event: string, callback: (pack: packageLoader.PackageInfo) => void) {
			broadcast.on(event, callback);
		},
		once(event: string, callback: (pack: packageLoader.PackageInfo) => void) {
			broadcast.once(event, callback);
		},
		off(event: string, callback: (pack: packageLoader.PackageInfo) => void) {
			broadcast.off(event, callback);
		},
	},
};
