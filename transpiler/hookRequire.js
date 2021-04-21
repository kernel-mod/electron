const pirates = require("pirates");
const path = require("path");
const transpiler = require("./cjs");

pirates.addHook((code, filePath) => transpiler(code), {
	exts: [".js", ".jsx", ".mjs", ".mjsx", ".cjs", ".cjsx", ".coffee"],
	matcher: (filePath) =>
		path.resolve(filePath).startsWith(path.resolve(__dirname, "..")),
	ignoreNodeModules: true,
});
