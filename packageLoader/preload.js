import { injectRendererModule } from "kernel/utilities";
import { ipcRenderer } from "electron";
import EventEmitter from "events";
import logger, { Logger } from "kernel/logger";
import fs from "fs-extra";
import path from "path";

export function getPackages() {
	return ipcRenderer.sendSync("KERNEL_GET_PACKAGES");
}
export function getOgre(
	packs = getPackages(),
	allPacks = getPackages(),
	first = true
) {
	return ipcRenderer.sendSync("KERNEL_GET_OGRE", packs);
}

export const events = new EventEmitter();
export const loadedPackages = {};

export async function load(ogre, packages) {
	// Load sync.
	for (const layer of ogre) {
		// Load the packages all at once.
		await Promise.all(
			layer.map(async (packageName) => {
				try {
					const packagePath = path.join(
						ipcRenderer.sendSync("KERNEL_GET_PACKAGES_FOLDER"),
						packages[packageName].folder,
						"preload.js"
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
