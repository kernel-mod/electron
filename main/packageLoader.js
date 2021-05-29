import logger from "kernel/logger";
import flipTree from "kernel/utilities/flipTree";
import fs from "fs-extra";
import path from "path";
import chokidar from "chokidar";

const packagesFolder = path.join(__dirname, "..", "packages");

const watcher = chokidar.watch("all", {
	persistent: true,
	ignoreInitial: true,
	followSymlinks: true,
});

export function getPackages() {
	// Yeeeeaaaaah, gonna see if I can make this faster later.
	return fs
		.readdirSync(packagesFolder, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name)
		.map((packageName) => {
			let packageJSON;
			try {
				packageJSON = fs.readJSONSync(
					path.join(packagesFolder, packageName, "index.json")
				);
			} catch {
				logger.error(`Package has no index.json.`);
			}
			return packageJSON;
		})
		.reduce(
			(packages, pack) => (
				(packages[pack.id] = (() => (delete pack.id, pack))()), packages
			),
			{}
		);
}

function invert(object) {
	var result = {};

	function setValue(target, path, value) {
		var last = path.pop();
		path.reduce((o, k) => (o[k] = o[k] || {}), target)[last] = value;
	}

	function iter(o, p) {
		if (o && typeof o === "object") {
			Object.keys(o).forEach((k) => iter(o[k], [...p, k]));
			return;
		}
		p.unshift(p.pop());
		setValue(result, p, o);
	}

	iter(object, []);
	return result;
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
) {
	let tree = {};

	for (const packName in packs) {
		const pack = allPacks[packName];
		if (!pack) {
			logger.error(`Missing dependency ${packName}.`);
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
				logger.error(
					`Failed load ${packName} because of missing dependencies.`
				);
			}
			continue;
		}
		tree[packName] = true;
	}

	if (first) {
		const ogre = [];
		tree = flipTree(tree);
		return tree;
	}
	return tree;
}

export function load(dir) {}

logger.time("Retrieved packages in");

const packages = getPackages();

getOgre(packages);

logger.timeEnd("Retrieved packages in");

watcher.on("change", (path, stats) => {});

logger.log(getOgre(packages));
