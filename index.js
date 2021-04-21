// Remember we can use `require` at any time because it's transpiled.

const pirates = require("pirates");
const transpiler = require("./transpiler");

pirates.addHook(
	(code, filePath) => {
		return transpiler.javascript(code);
	},
	{
		exts: [".js", ".jsx", ".mjs", ".mjsx", ".cjs", ".cjsx", ".coffee"],
		matcher: (filePath) =>
			!filePath.includes("@babel") && !filePath.includes("node_modules"),
		ignoreNodeModules: false,
	}
);

require("./main");
