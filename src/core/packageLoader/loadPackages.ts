import loadPackage from "./loadPackage";
import Ogre from "./Ogre";
import Logger from "../Logger";

export default function loadPackages(ogre: Ogre, broadcast: boolean = true) {
	Logger.log("Loading packages...");

	for (const layer of ogre) {
		for (const packageID of Object.keys(layer)) {
			loadPackage(packageID, broadcast);
		}
	}
}
