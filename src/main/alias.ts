import * as importPatcher from "../core/patchers/ImportPatcher";
import path from "path";
import fs from "fs";

importPatcher.patch("kernel-aliases", (id, stringify) => {
	if (id.startsWith("#kernel")) {
		const lightningMcMeth = path.join(
			__dirname,
			"..",
			id.replace(/^#kernel\/?/, "")
		);
		return stringify
			? fs.readFileSync(lightningMcMeth)
			: require(lightningMcMeth);
	}
});
