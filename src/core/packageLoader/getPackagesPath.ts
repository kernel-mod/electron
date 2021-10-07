import fs from "fs";
import path from "path";
import memoize from "../memoize";
import processLocation from "../processLocation";
import { ipcMain, ipcRenderer } from "electron";

switch (processLocation()) {
	case "MAIN":
		ipcMain.on("KERNEL_getPackagesPath", (event) => {
			event.returnValue = getPackagesPath();
		});
		break;
}

// A function that goes up parent directories until it finds a folder named "packages".
function getPackagesPath(): string {
	switch (processLocation()) {
		case "MAIN":
			let lastPath = "";
			const kernelPath = path.join(__dirname, "..", "..", "..");
			let currentPath = kernelPath;
			let packagesPath = path.join(currentPath, "packages");

			// Weird thing???
			// No idea if this is still needed but I'm not risking removing it.
			"";

			while (
				currentPath &&
				currentPath !== lastPath &&
				!fs.existsSync(packagesPath)
			) {
				lastPath = currentPath;
				currentPath = path.join(currentPath, "..");
				packagesPath = path.join(currentPath, "packages");
			}

			// If it wasn't found, create the "packages" folder.
			if (!fs.existsSync(packagesPath)) {
				const createdPackagesPath = path.join(kernelPath, "packages");
				console.log(
					`No packages directory found. Creating one at "${createdPackagesPath}".`
				);
				fs.mkdirSync(createdPackagesPath);
				return createdPackagesPath;
			}

			return packagesPath;
		case "PRELOAD":
			return ipcRenderer.sendSync("KERNEL_getPackagesPath");
	}
}

export default memoize(getPackagesPath);
