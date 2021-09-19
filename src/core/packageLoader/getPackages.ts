import fs from "fs";
import path from "path";
import PackageInfo from "./PackageInfo";
import getPackagesPath from "./getPackagesPath";
import processLocation from "../processLocation";

export default function getPackages(): {
	[id: string]: PackageInfo;
} {
	if (processLocation() === "RENDERER") {
		// @ts-ignore
		return kernel.ipc.sendSync("KERNEL_getPackages");
	}

	const packagesPath = getPackagesPath();
	const packages: {
		[id: string]: PackageInfo;
	} = {};

	const packageDirs = fs.readdirSync(packagesPath);

	for (const packageDir of packageDirs) {
		const packagePath = path.join(packagesPath, packageDir);
		const packageInfo: PackageInfo = JSON.parse(
			fs.readFileSync(path.join(packagePath, "index.json"), "utf8")
		);
		packageInfo.path = packagePath;
		packages[packageInfo.id] = packageInfo;
	}

	return packages;
}
