import loadPackage from "./loadPackage";
import Ogre from "./Ogre";

export default function loadPackages(ogre: Ogre) {
	for (const layer of ogre) {
		for (const packageID of Object.keys(layer)) {
			loadPackage(packageID);
		}
	}
}
