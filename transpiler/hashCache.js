const crypto = require("crypto");
const fs = require("fs-extra");
const path = require("path");
const { app } = require("electron");
const zlib = require("zlib");
const { promisify } = require("util");
const { debounce } = require("lodash");

const promisifiedBrotliCompress = promisify(zlib.brotliCompress);
const promisifiedBrotliDecompress = promisify(zlib.brotliDecompress);

let cacheData = {};
const cachePath = path.join(path.basename(import.meta.url), "cache.br");
// loadSync();

const cache = () =>
	!app?.commandLine?.hasSwitch?.("kernel-no-cache") ??
	!~process.argv.indexOf("--kernel-no-cache");

if (!cache()) {
	clear();
}

function daysFromNow(days) {
	return new Date(new Date().getTime() + days * 24 * 60 * 60 * 1000).getTime();
}

export async function async(code, transpileFunction) {
	const hash = crypto.createHash("md5").update(code).digest("hex");

	if (cache()) {
		// Test if the date cache[hash].ttl is before the current date.
		// If so, the cached value is returned.
		if (cacheData[hash]) {
			if (cacheData[hash].ttl >= Date.now()) return cacheData[hash].code;
			// This is to ensure that the cache is not filled with old values.
			delete cacheData[hash];
		}

		const transpiledCode = await transpileFunction();
		cacheData[hash] = { ttl: daysFromNow(7), code: transpiledCode };

		save();

		return transpiledCode;
	}

	return await transpileFunction();
}

export function sync(code, transpileFunction) {
	const hash = crypto.createHash("md5").update(code).digest("hex");

	if (cache()) {
		// Test if the date cache[hash].ttl is before the current date.
		// If so, the cached value is returned.
		if (cacheData[hash]) {
			if (cacheData[hash].ttl >= Date.now()) return cacheData[hash].code;
			// This is to ensure that the cache is not filled with old values.
			delete cacheData[hash];
		}

		const transpiledCode = transpileFunction();
		cacheData[hash] = { ttl: daysFromNow(7), code: transpiledCode };

		save();

		return transpiledCode;
	}

	return transpileFunction();
}

export async function clear() {
	return await fs.unlink(cachePath);
}

async function _save() {
	return await fs.writeFile(
		cachePath,
		await promisifiedBrotliCompress(JSON.stringify(cacheData))
	);
}

export const save = debounce(_save, 100);

export async function load() {
	try {
		if (await fs.access(cachePath)) {
			return (cacheData = JSON.parse(
				await promisifiedBrotliDecompress(await fs.readFile(cachePath))
			));
		}
	} catch (e) {
		console.error("Cache corrupted.");
		clear();
	}
	return (cacheData = {});
}

export function loadSync() {
	try {
		if (fs.existsSync(cachePath)) {
			return (cacheData = JSON.parse(
				zlib.brotliDecompressSync(fs.readFileSync(cachePath))
			));
		}
	} catch (e) {
		console.error("Cache corrupted.");
		clear();
	}
	return (cacheData = {});
}

function nanoseconds() {
	const hrTime = process.hrtime();
	return hrTime[0] * 1000000000 + hrTime[1];
}

// module.exports = {
// 	sync,
// 	async,
// 	clear,
// 	save,
// 	load,
// 	loadSync,
// };
