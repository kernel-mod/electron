import path from "path";
import getPackages from "./getPackages";
import loadedPackages from "./loadedPackages";
import fs from "fs";

export default function loadPackage(packageID: string, context: string) {
	const pack = getPackages()[packageID];

	const packageScript = path.join(pack.path, `${context}.js`);

	if (fs.existsSync(packageScript)) {
		const packageClass = require(packageScript);
		const packageInstance = new (
			packageClass.default ? packageClass.default : packageClass
		)();

		loadedPackages[packageID] = {
			enabled: true,
			...pack,
			instance: packageInstance,
		};

		if (loadedPackages[packageID].enabled) {
			packageInstance.start?.();
		}
	}
}
