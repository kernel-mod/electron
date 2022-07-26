import path from "path";
import getPackages from "./getPackages";
import loadedPackages from "./loadedPackages";
import fs from "fs";
import processLocation from "../utils/processLocation";
import startPackage from "./startPackage";
import _startPackage from "./_startPackage";

export default function loadPackage(
	packageID: string,
	broadcast: boolean = true
) {
	const context = processLocation().toLowerCase();

	const pack = getPackages()[packageID];

	const packageScript = path.join(pack.path, pack[context] ?? context);
   const hasScript = (() => {
      try {
         require.resolve(packageScript);
         return true;
      } catch {
         return false;
      }
   })();

	if (hasScript) {
		const packageExport = require(packageScript);
		const packageInstance = packageExport.default
			? packageExport.default
			: packageExport;

		loadedPackages[packageID] = {
			...pack,
			enabled: true,
			instance: packageInstance,
		};

		if (loadedPackages[packageID].enabled) {
			if (broadcast) {
				startPackage(packageID);
			} else {
				_startPackage(packageID);
			}
		}
	}
}
