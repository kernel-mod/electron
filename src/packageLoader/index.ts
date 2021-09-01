import * as fs from "fs";
import * as path from "path";

let packagePath = path.join(__dirname, "..", "..", "..", "..", "packages");

export interface PackageInfo {
	id: string;
	name: string;
	version?: string;
	dependencies?: string[];
}

export interface Ogre {
	[index: number]: string[];
}

export function getPackages(): {
	[id: string]: PackageInfo;
} {
	const packages: {
		[id: string]: PackageInfo;
	} = {};

	const packageDirs = fs.readdirSync(packagePath);

	for (const packageDir of packageDirs) {
		const packageInfo: PackageInfo = JSON.parse(
			fs.readFileSync(path.join(packagePath, packageDir, "index.json"), "utf8")
		);
		packages[packageInfo.id] = packageInfo;
	}

	return packages;
}

/* GARBAGE BEGINS */

function walk(node, callback) {
	if (typeof node === "object") {
		for (const child of Object.values(node)) {
			if (typeof child === "object") {
				walk(child, callback);
			}
		}
	}
	callback(node);
}

function treeDepth(object) {
	if (typeof object !== "object") return 0;
	let depth = 1;
	for (const child of Object.values(object)) {
		if (typeof child === "object") {
			const childDepth = treeDepth(child) + 1;
			depth = Math.max(childDepth, depth);
		}
	}
	return depth;
}

/**
 * @typedef {object[(string|Ogre)]} Ogre
 */

export /**
	Ogres are like onions. They have layers.
	Each layer loads sync to make sure deps load first, but everything in that layer loads async.
	This function constructs those layers as a tree based on the package data you give it.
	They're also ugly, just like how these packages have to load.
	@returns {Ogre}
*/ function getOgre(
	packs = getPackages(),
	allPacks = getPackages(),
	first = true
): Ogre {
	let tree = {};

	for (const packName in packs) {
		const pack = allPacks[packName];
		if (!pack) {
			console.error(`Missing dependency ${packName}.`);
			continue;
		}
		if (Boolean(pack.dependencies) && pack.dependencies.length > 0) {
			const deepOgre = getOgre(
				pack.dependencies.reduce(
					(depPacks, dep) => ((depPacks[dep] = packs[dep]), depPacks),
					{}
				),
				allPacks,
				false
			);
			if (Object.keys(deepOgre).length === pack.dependencies.length) {
				tree[packName] = deepOgre;
			} else {
				console.error(
					`Failed load ${packName} because of missing dependencies.`
				);
			}
			continue;
		}
		tree[packName] = true;
	}

	if (first) {
		let ogre = [];

		walk(tree, (node) => {
			for (const [key, value] of Object.entries(node)) {
				const depth = treeDepth(value);
				if (!ogre[depth]) ogre[depth] = [key];
				else ogre[depth].push(key);
			}
		});

		const found = new Set();
		for (let i = 0; i < ogre.length; i++) {
			ogre[i] = [...new Set(ogre[i].filter((id) => !found.has(id)))];
			for (const id of ogre[i]) {
				found.add(id);
			}
		}

		return ogre;
	}
	return tree;
}

/* GARBAGE ENDS */

// TODO: Please, future me, finish this function so I don't have to look at the garbage above.
// Keep resolving packages out of this implementation. Do that when it actually starts loading the packages.

// export function getOgre(packages: PackageInfo[]): Ogre {
// 	const ogre: Ogre = [];

// 	function recurseDeps(pack: PackageInfo, level: number = 0) {
// 		if (ogre[level] === undefined) {
// 			ogre[level] = [];
// 		}
// 		ogre[level].push(pack.id);

// 		if (pack.dependencies) {
// 			for (const dep of pack.dependencies) {
// 				const depPack = packages.find((p) => p.id === dep);
// 				if (depPack) {
// 					recurseDeps(depPack, level + 1);
// 				}
// 			}
// 		}
// 	}

// 	for (const pack of packages) {
// 		recurseDeps(pack);
// 	}

// 	return ogre;
// }

const packages = getPackages();
const ogre = getOgre(packages);

console.log(packages, ogre);
