#!/usr/bin/env zx

import fs from "fs";
import * as path from "path";

await fs.promises.rm("./transpiled", { recursive: true, force: true });

console.time("Successfully built");

// TODO: Figure out how --ignore works.
await $`npx swc ./node_modules -d ./transpiled/node_modules --ignore electron/*.js`;

// Delete the unneeded modules.
const unneededModules = ["electron", "@types", "asar", "@swc"];
for (const mod of unneededModules) {
	await fs.promises.rm(`./transpiled/node_modules/${mod}`, {
		recursive: true,
		force: true,
	});
}

await $`npx swc ./src -d ./transpiled`;

// Build the renderer and copy it over.
const baseDir = path.join(__dirname, "..");
cd(path.join(baseDir, "..", "browser"));
await $`npm run build`;
await fs.promises.copyFile(
	path.join(baseDir, "..", "browser", "dist", "index.js"),
	path.join(baseDir, "src", "preload", "renderer.js")
);
cd(baseDir);

console.time("Successfully packed");
await $`asar pack ./transpiled ./dist/kernel.asar`;
console.timeEnd("Successfully packed");

console.timeEnd("Successfully built");

const stats = fs.statSync("./dist/kernel.asar");
const fileSizeInBytes = stats.size;
const fileSizeInMegabytes = fileSizeInBytes / 1024;

console.log(`Build size: ${fileSizeInMegabytes.toLocaleString()} KB`);
