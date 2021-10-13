import * as packageLoader from "../../../core/packageLoader";
import broadcast from "../../../core/broadcast";
import fs from "fs";

export default {
	getPackages(): {
		[id: string]: packageLoader.PackageInfo;
	} {
		return packageLoader.getPackages();
	},
	getOgre(
		packages: {
			[id: string]: packageLoader.PackageInfo;
		} = packageLoader.getPackages()
	): packageLoader.Ogre {
		return packageLoader.getOgre(packages);
	},
	hasRendererScript(packageID: string) {
		return fs.existsSync(
			`${packageLoader.getPackages()[packageID].path}/renderer.js`
		);
	},
	startPackage(packageID: string) {
		broadcast.emit("startPackage", packageID);
	},
	stopPackage(packageID: string) {
		broadcast.emit("stopPackage", packageID);
	},
	events: {
		on(event: string, callback: (...data: any) => void) {
			broadcast.on(event, callback);
		},
		once(event: string, callback: (...data: any) => void) {
			broadcast.once(event, callback);
		},
		off(event: string, callback: (pack: packageLoader.PackageInfo) => void) {
			broadcast.off(event, callback);
		},
	},
};
