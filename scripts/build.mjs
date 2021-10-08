#!/usr/bin/env zx

import fs from "fs-extra";
import path from "path";
import swc from "@swc/core";
import { promisify } from "util";
import glob from "glob";
import asar from "asar";

try {
	await fs.emptyDir("./dist");
} catch {}
await fs.rm("./transpiled", { recursive: true, force: true });

console.time("Successfully built");

const production = !argv.hasOwnProperty("dev");

const globp = promisify(glob);

const sourceFiles = (
	await globp(path.join(__dirname, "..", "src", "**/*.ts"), {}).catch((e) =>
		console.error("Failed to glob source files:", e)
	)
).map((p) => ({
	input: p,
	// Dumb make better.
	output: p
		.replace("/src/", "/transpiled/")
		.replace("\\src\\", "\\transpiled\\")
		.replace(/\.tsx?$/, ".js"),
}));

for (const file of sourceFiles) {
	const code = fs.readFileSync(file.input, "utf8");
	swc
		.transform(code, {
			// Some options cannot be specified in .swcrc
			filename: path.basename(file.input),
			jsc: {
				parser: {
					syntax: "typescript",
					tsx: true,
					decorators: true,
					dynamicImport: true,
					importAssertions: true,
				},
				transform: {},
				target: "es2016",
				loose: true,
				externalHelpers: false,
				keepClassNames: true,
				minify: {
					compress: production,
					mangle: production,
				},
				// paths: {
				// 	"@kernel": ["../core/src/index.js"],
				// 	"@kernel/*": ["../core/src/*"],
				// },
			},
			module: {
				type: "commonjs",
				strict: false,
				strictMode: true,
				lazy: false,
				noInterop: false,
			},
			minify: production,
			sourceMaps: "inline",
		})
		.then((output) => {
			fs.ensureFileSync(file.output);
			fs.writeFile(file.output, output.code);
		});
}

// await fs.copy(
// 	"./node_modules/@swc/helpers",
// 	"./transpiled/node_modules/@swc/helpers",
// 	{
// 		recursive: true,
// 		// filter: (src, dest) => {
// 		// 	return ![".pnpm", ".bin"].includes(path.basename(src));
// 		// },
// 		dereference: true,
// 	}
// );

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

console.time("Successfully packed");
await asar.createPackage(
	path.join(__dirname, "..", "transpiled"),
	path.join(__dirname, "..", "dist", "kernel.asar")
);
console.timeEnd("Successfully packed");

console.timeEnd("Successfully built");

const stats = fs.statSync("./dist/kernel.asar");
const fileSizeInBytes = stats.size;
const fileSizeInKilobytes = fileSizeInBytes / 1024;

console.log(`Build size: ${fileSizeInKilobytes.toLocaleString()} KB`);
