const pirates = require("pirates");
const transpiler = require("./javascript");

pirates.addHook(
	(code, filePath) => {
		return transpiler(code);
	},
	{
		exts: [".js", ".jsx", ".mjs", ".mjsx", ".cjs", ".cjsx", ".coffee"],
		matcher: (filePath) =>
			!filePath.includes("@babel") && !filePath.includes("node_modules"),
		ignoreNodeModules: false,
	}
);