import path from "path";
import electron from "electron";
import fs from "fs";
import Logger from "#kernel/core/Logger";

Logger.log("Starting original app.");

// We can get the path of the real injection point like this.
const basePath = path.join(path.dirname(require.main.filename), "..");
let originalPath = path.join(basePath, "app-original.asar");
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
// @ts-ignore
electron.app.setAppPath?.(originalPath);
// Make sure the storage location doesn't change.
electron.app.name = originalPackage.name;

// Load the app's original code.
// Run with require to make sure it doesn't await in main process because that can be bad.
require(startPath);
