import * as path from "path";
import * as electron from "electron";
import * as fs from "fs";

// We can get the path of the real injection point like this.
const basePath = path.join(path.dirname(require.main.filename), "..");
let originalPath = path.join(basePath, "app.asar");
// Check if originalPath file exists.
if (!fs.existsSync(originalPath)) {
	originalPath = path.join(basePath, "app-original");
}

const originalPackage = require(path.resolve(
	path.join(originalPath, "package.json")
));

const startPath = path.join(originalPath, originalPackage.main);

// Don't corrupt the app on update.
require.main.filename = startPath;

// Load the app's original code.
// @ts-ignore
electron.app.setAppPath?.(originalPath);
electron.app.name = originalPackage.name;
import(startPath);
