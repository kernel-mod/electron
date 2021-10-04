import path from "path";
import getPackages from "./getPackages";
import loadedPackages from "./loadedPackages";
import fs from "fs";
import processLocation from "../processLocation";

export default function loadPackage(packageID: string) {
	const context = processLocation().toLowerCase();

	const pack = getPackages()[packageID];

	const packageScript = path.join(pack.path, `${context}.js`);

	if (fs.existsSync(packageScript)) {
		const packageClass = require(packageScript);
		const packageInstance = new (
			packageClass.default ? packageClass.default : packageClass
		)();

		loadedPackages.set(packageID, {
			enabled: true,
			...pack,
			instance: packageInstance,
		});

		if (loadedPackages.get(packageID).enabled) {
			packageInstance.start?.();
		}
	}
}
