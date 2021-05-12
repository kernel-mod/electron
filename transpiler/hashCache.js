const hasha = require("hasha");
const fs = require("fs-extra");
const path = require("path");

const cachePath = path.join(__dirname, "cache");

const cache = true;

async function async(code, transpileFunction, ...transpileArgs) {
	const hash = hasha(code, { algorithm: "md5" });

	const hashedFilePath = path.join(cachePath, hash);

	if (cache && fs.existsSync(hashedFilePath)) {
		return await fs.readFile(hashedFilePath, "utf-8");
	}

	const transpiledCode = (await transpileFunction(...transpileArgs)).code;

	// We want this to run and not block the returning of the transpiled code.
	if (cache) {
		fs.ensureFile(hashedFilePath).then(() => {
			fs.writeFile(hashedFilePath, transpiledCode, "utf-8");
		});
	}

	return transpiledCode;
}

function sync(code, transpileFunction, ...transpileArgs) {
	const hash = hasha(code, { algorithm: "md5" });

	const hashedFilePath = path.join(cachePath, hash);

	if (cache && fs.existsSync(hashedFilePath)) {
		return fs.readFileSync(hashedFilePath, "utf-8");
	}
	const transpiledCode = transpileFunction(...transpileArgs).code;

	// We want this to run and not block the returning of the transpiled code.
	if (cache) {
		fs.ensureFile(hashedFilePath).then(() => {
			fs.writeFile(hashedFilePath, transpiledCode, "utf-8");
		});
	}

	return transpiledCode;
}

async function clear() {
	if (fs.existsSync(cachePath)) {
		return await fs.rmdir(cachePath, { recursive: true });
	}
}

module.exports = { sync, async, clear };
