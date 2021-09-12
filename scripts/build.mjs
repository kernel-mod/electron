#!/usr/bin/env zx

import fs from "fs-extra";
import * as path from "path";

try {
	await fs.emptyDir("./dist");
} catch {}
await fs.rm("./transpiled", { recursive: true, force: true });

console.time("Successfully built");

// TODO: Figure out how --ignore works.
await $`npx swc ./node_modules -d ./transpiled/node_modules --ignore electron/*.js`;

// Delete the unneeded modules.
const unneededModules = [
	"@types",
	...Object.keys(JSON.parse(fs.readFileSync("./package.json")).devDependencies),
];
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
await fs.copyFile(
	path.join(baseDir, "..", "browser", "dist", "index.js"),
	path.join(baseDir, "transpiled", "preload", "renderer.js")
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
