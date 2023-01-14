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

// Set app's version
if (originalPackage.version != null) {
// @ts-ignore
	electron.app.setVersion(originalPackage.version)
}

// Set app's name
// Make sure the storage location doesn't change.
if (originalPackage.productName != null) {
	electron.app.name = `${originalPackage.productName}`.trim();
} else if (originalPackage.name != null) {
	electron.app.name = `${originalPackage.name}`.trim();
}

// Set app's desktop name
if (originalPackage.desktopName != null) {
// @ts-ignore
	electron.app.setDesktopName(originalPackage.desktopName);
} else {
// @ts-ignore
	electron.app.setDesktopName(`${electron.app.name}.desktop`);
}

// Set v8's flags
if (originalPackage.v8Flags != null) {
	require('v8').setFlagsFromString(originalPackage.v8Flags);
}

// Don't corrupt the app on update.
require.main.filename = startPath;
// @ts-ignore
electron.app.setAppPath?.(originalPath);

// Load the app's original code.
// Run without import() to make sure it doesn't await in main process because that can be bad.
// Module._load(file, Module, true) is used instead of require() because it lets you load the file as if it was the first file being run in the Node environment.
// Using require could result in things breaking if the app ever uses require.main.
// @ts-ignore This does exist, it's just not typed.
Module._load(startPath, Module, true); // changed second arg to reference itself, as apparently electron itself would do it, not sure why, changed to increase compatibility
