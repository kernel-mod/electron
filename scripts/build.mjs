#!/usr/bin/env zx

import path from "path";
import fs, { copySync } from "fs-extra";
import asar from "asar";
import { builtinModules } from "module";
import swc from "@swc/core";
import { promisify } from "util";
import glob from "glob";
import minimist from "minimist";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const argv = minimist(process.argv.slice(2));

const externals = ["electron", /^#kernel(.*)/, "./core.js", ...builtinModules];
// It's externals but as an object where the keys and values are the items in the array.
const externalNames = externals.reduce((acc, cur) => {
	acc[cur] = cur;
	return acc;
}, {});

await fs.rm("./temp", { recursive: true, force: true });

console.time("Successfully built");

console.time("Successfully transpiled");

const production = !argv.hasOwnProperty("dev");

const globp = promisify(glob);

copySync("./src", "./temp");
copySync("./package.json", "./temp/package.json");

let sourceFiles = await globp(
	path.join(__dirname, "..", "temp", "**/*.ts"),
	{}
).catch((e) => console.error("Failed to glob source files:", e));
sourceFiles = sourceFiles.reduce((acc, cur) => {
	acc.push({ input: cur, output: cur.replace(/\.tsx?$/, ".js") });
	return acc;
}, []);

for (const file of sourceFiles) {
	const code = fs.readFileSync(file.input, "utf8");
	await swc
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
		})
		.then((output) => {
			fs.ensureFileSync(file.output);
			fs.writeFileSync(file.output, output.code);
			fs.rmSync(file.input);
		});
}

console.timeEnd("Successfully transpiled");

console.time("Successfully packed");
await asar.createPackage(
	path.resolve("temp"),
	path.resolve("dist", "kernel.asar")
);
console.timeEnd("Successfully packed");

console.timeEnd("Successfully built");

const stats = fs.statSync("./dist/kernel.asar");
const fileSizeInBytes = stats.size;
const fileSizeInKilobytes = fileSizeInBytes / 1024;

console.log(`Build size: ${fileSizeInKilobytes.toLocaleString()} KB`);
