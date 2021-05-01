const hasha = require("hasha");
const fs = require("fs-extra");
const path = require("path");

function async(code, transpileFunction, ...transpileArgs) {
	return new Promise(async (resolve) => {
		const hash = hasha(code, { algorithm: "md5" });

		const hashedFilePath = path.join(__dirname, "cache", hash);

		if (fs.existsSync(hashedFilePath)) {
			return resolve(await fs.readFile(hashedFilePath, "utf-8"));
		}

		const transpiledCode = (await transpileFunction(...transpileArgs)).code;

		await fs.ensureFile(hashedFilePath);
		await fs.writeFile(hashedFilePath, transpiledCode, "utf-8");

		resolve(transpiledCode);
	});
}

function sync(code, transpileFunction, ...transpileArgs) {
	const hash = hasha(code, { algorithm: "md5" });

	const hashedFilePath = path.join(__dirname, "cache", hash);

	if (fs.existsSync(hashedFilePath)) {
		return fs.readFileSync(hashedFilePath, "utf-8");
	}
	const transpiledCode = transpileFunction(...transpileArgs).code;

	fs.ensureFileSync(hashedFilePath);
	fs.writeFileSync(hashedFilePath, transpiledCode, "utf-8");

	return transpiledCode;
}

module.exports = { sync, async };
