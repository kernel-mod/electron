#!/usr/bin/env zx

import fs from "fs-extra";
import * as path from "path";

try {
	await fs.emptyDir("./dist");
} catch {}
await fs.rm("./transpiled", { recursive: true, force: true });

console.time("Successfully built");

// TODO: Just copy over and minify the Node modules instead.
// Build the required Node modules into the temporary directory.
// TODO: Figure out how --ignore works.
// await $`npx swc ./node_modules -d ./transpiled/node_modules --ignore electron/*.js`;
// // This is for if a module needs files with extensions other than .js such as .json.
// await fs.copy("./node_modules", "./transpiled/node_modules", {
// 	recursive: true,
// 	filter: (src, dest) => {
// 		return ![".pnpm", ".bin"].includes(path.basename(src));
// 	},
// 	dereference: true,
// });

await $`npx swc ./src -d ./transpiled`;

// Delete the unneeded modules.
// const unneededModules = [
// 	"@types",
// 	"@swc",
// 	...Object.keys(JSON.parse(fs.readFileSync("./package.json")).devDependencies),
// ];
// for (const mod of unneededModules) {
// 	await fs.rm(`./transpiled/node_modules/${mod}`, {
// 		recursive: true,
// 		force: true,
// 	});
// }

const baseDir = path.join(__dirname, "..");

// Build the renderer and copy it over.
cd(path.join(baseDir, "..", "browser"));
await $`pnpm run build`;
await fs.copyFile(
	path.join(baseDir, "..", "browser", "dist", "index.js"),
	path.join(baseDir, "transpiled", "preload", "renderer.js")
);

// Build the core and copy it over.
// cd(path.join(baseDir, "..", "core"));
// await $`npm run build`;
// await fs.copyFile(
// 	path.join(baseDir, "..", "core", "dist", "index.js"),
// 	path.join(baseDir, "transpiled", "core.js")
// );

cd(baseDir);

console.time("Successfully packed");
await $`pnpx asar pack ./transpiled ./dist/kernel.asar`;
console.timeEnd("Successfully packed");

console.timeEnd("Successfully built");

const stats = fs.statSync("./dist/kernel.asar");
const fileSizeInBytes = stats.size;
const fileSizeInKilobytes = fileSizeInBytes / 1024;

console.log(`Build size: ${fileSizeInKilobytes.toLocaleString()} KB`);
