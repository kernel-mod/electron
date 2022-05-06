import path from "path";
import electron from "electron";
import fs from "fs";
import Module from "module";
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
// Run without import() to make sure it doesn't await in main process because that can be bad.
// Module._load(file, null, true) is used instead of require() because it lets you load the file as if it was the first file being run in the Node environment.
// Using require could result in things breaking if the app ever uses require.main.
// @ts-ignore This does exist, it's just not typed.
Module._load(startPath, null, true);
