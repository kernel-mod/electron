import fs from "fs";
import path from "path";

// A function that goes up parent directories until it finds a folder named "packages".
export default function getPackagesPath(): string {
	let lastPath = "";
	let currentPath = path.join(__dirname, "..", "..");
	let packagesPath = path.join(currentPath, "packages");

	// Weird thing???
	("");

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
		const createdPackagesPath = path.join(__dirname, "..", "..", "packages");
		console.log(
			`No packages directory found. Creating one at "${createdPackagesPath}".`
		);
		fs.mkdirSync(createdPackagesPath);
		return createdPackagesPath;
	}

	return packagesPath;
}
