import fs from "fs";
import path from "path";
import memoize from "../utils/memoize";
import processLocation from "../utils/processLocation";
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
			// Directory in which kernel.asar is in
			const kernelPath = path.join(__dirname, "..", "..", "..");
			const rootPath = path.parse(__dirname).root;
			let currentPath = kernelPath;

			while (true) {
				if (fs.existsSync(path.join(currentPath, "packages"))) break;
				if (currentPath !== rootPath) {
					// Traverse further up
					currentPath = path.parse(currentPath).dir;
					continue;
				};

				const packagesPath = path.join(kernelPath, "packages");
				console.log(`No package directory found. Creating one at "${packagesPath}"`);
				fs.mkdirSync(packagesPath);
				return packagesPath;
			}

			return path.join(currentPath, "packages");

		case "PRELOAD":
			return ipcRenderer.sendSync("KERNEL_getPackagesPath");
	}
}

export default memoize(getPackagesPath);
