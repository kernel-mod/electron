import * as path from "path";
import * as electron from "electron";

// We can get the path of the real injection point like this.
const basePath = path.join(path.dirname(require.main.filename), "..");
const asarPath = path.join(basePath, "app.asar");

const originalPackage = require(path.resolve(
	path.join(asarPath, "package.json")
));

const startPath = path.join(asarPath, originalPackage.main);

// Don't corrupt the app on update.
require.main.filename = startPath;

// Load the app's original code.
// @ts-ignore
electron.app.setAppPath?.(asarPath);
electron.app.name = originalPackage.name;
import(startPath);
