#!/usr/bin/env zx

import fs from "fs-extra";
import path from "path";
import swc from "@swc/core";
import { promisify } from "util";
import glob from "glob";
import asar from "asar";
import { exec } from "child_process";
import minimist from "minimist";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const argv = minimist(process.argv.slice(2));

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
	swc.transform(code, {
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
			target: "es2017",
			loose: true,
			externalHelpers: false,
			keepClassNames: true,
			minify: {
				compress: false, // TODO: Figure out why this breaks package loading in main.
				mangle: production,
			},
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
	}).then((output) => {
		fs.ensureFileSync(file.output);
		fs.writeFile(file.output, output.code);
	});
}

// Save this for possibly using it in the future.
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
await new Promise((resolve) =>
	exec(
		`cd ${path.join(baseDir, "..", "browser")} && pnpm run build`,
		(err, stdout, stderr) => {
			if (err) {
				console.error(err);
				return;
			}
			console.log(stdout);
			resolve();
		}
	)
);

await fs.ensureDir(path.join(baseDir, "transpiled", "renderer"));
await fs.copyFile(
	path.join(baseDir, "..", "browser", "dist", "index.js"),
	path.join(baseDir, "transpiled", "renderer", "index.js")
);

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
