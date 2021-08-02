// TODO: Maybe move this and the transpiler to kernel/core?

import logger, { Logger } from "kernel/logger";
import fs from "fs-extra";
import path from "path";
import chokidar from "chokidar";
import _ from "lodash";
import EventEmitter from "events";
import { ipcMain } from "electron";

const packagesFolder = path.join(__dirname, "..", "packages");

const watcher = chokidar.watch("all", {
	persistent: true,
	ignoreInitial: true,
	followSymlinks: true,
});

export function getPackages() {
	return fs
		.readdirSync(packagesFolder, { withFileTypes: true })
		.reduce((packages, dirent) => {
			if (!dirent.isDirectory()) return packages;
			let packageJSON = {};

			try {
				packageJSON = fs.readJSONSync(
					path.join(packagesFolder, dirent.name, "index.json")
				);
			} catch (err) {
				return void logger.error(
					`Package ${packageFolderName} could not be loaded!`,
					err
				);
			}

			packageJSON.folder = dirent.name;
			packages[packageJSON.id] = (delete packageJSON.id, packageJSON);
			return packages;
		}, {});
}

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

export const events = new EventEmitter();
export const loadedPackages = {};

// TODO: Move this to its own file.
export async function load(ogre, packages) {
	// Load sync.
	for (const layer of ogre) {
		// Load the packages all at once.
		await Promise.all(
			layer.map(async (packageName) => {
				try {
					const packagePath = path.join(
						packagesFolder,
						packages[packageName].folder,
						"main.js"
					);
					if (!fs.existsSync(packagePath)) return;

					let packageClass = await import(packagePath);
					packageClass = packageClass.default ?? packageClass;
					events.emit("PACKAGE_LOAD", {
						package: packages[packageName],
						class: packageClass,
					});
					packageClass.prototype.logger = new Logger(
						packages[packageName].name ?? packageName
					);
					packageClass = new packageClass();

					events.emit("PACKAGE_START", {
						package: packages[packageName],
						class: packageClass,
					});
					await packageClass.start();
					return void (loadedPackages[packageName] = packageClass);
				} catch (err) {
					return void logger.error(`Failed to load ${packageName}:`, err);
				}
			})
		);
	}
}

ipcMain.on("KERNEL_GET_PACKAGES_FOLDER", (event, arg) => {
	event.returnValue = packagesFolder;
});
ipcMain.on("KERNEL_GET_PACKAGES", (event, arg) => {
	event.returnValue = getPackages();
});
ipcMain.on("KERNEL_GET_OGRE", (event, packages) => {
	if (packages) {
		return void (event.returnValue = getOgre(packages));
	}
	event.returnValue = getOgre();
});
