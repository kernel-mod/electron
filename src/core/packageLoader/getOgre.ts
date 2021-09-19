import processLocation from "../processLocation";
import getPackages from "./getPackages";
import Ogre from "./Ogre";
import PackageInfo from "./PackageInfo";

export default function getOgre(
	packages: { [id: string]: PackageInfo } = getPackages()
): Ogre {
	if (processLocation() === "RENDERER") {
		// @ts-ignore
		return kernel.ipc.sendSync("KERNEL_getOgre");
	}

	let ogre: Ogre = [{}];

	// Add all the packages to the start of the ogre.
	for (const [id, pack] of Object.entries(packages)) {
		ogre[0][id] = pack;
	}

	// Adjust the order of the items based on their dependencies.
	let lastOgres = new Set();
	// Adjust while there are still changes being made.
	while (!lastOgres.has(JSON.stringify(ogre))) {
		lastOgres.add(JSON.stringify(ogre));

		// Copy because of circular deps.
		const iOgre = [...ogre];
		for (let i = 0; i < iOgre.length; i++) {
			const layer = iOgre[i];

			for (const [id, pack] of Object.entries(layer)) {
				// If the package has no dependencies it can be moved straight to the lowest level of the ogre.
				if (!pack.dependencies || pack.dependencies.length === 0) {
					delete layer[id];
					ogre[0][id] = pack;
					continue;
				}
				// The package has dependencies, so we need to find the highest level of the ogre that has one of the dependencies.
				let highestLayer = -1;
				// Copy because of circular deps.
				const jOgre = [...ogre];
				for (let j = 0; j < jOgre.length; j++) {
					const layerKeys = Object.keys(jOgre[j]);
					if (
						pack.dependencies.some((idToCheck) => layerKeys.includes(idToCheck))
					) {
						highestLayer = j;
					}
				}
				// Put the package in the layer above the highest layer there was a dependency in.
				const newLayer = highestLayer + 1;
				if (newLayer !== i) {
					delete layer[id];
					if (!ogre[newLayer]) ogre[newLayer] = { [id]: pack };
					else ogre[newLayer][id] = pack;
				}
			}
		}

		// Remove empty objects.
		for (let i = 0; i < ogre.length; i++) {
			while (Object.keys(ogre[i]).length === 0) {
				ogre.splice(i, 1);
			}
		}
	}

	return ogre;
}
