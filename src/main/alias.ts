import * as importPatcher from "../core/patchers/ImportPatcher";
import path from "path";

importPatcher.patch("kernel-aliases", (id) => {
	if (id.startsWith("#kernel")) {
		return require(path.join(__dirname, "..", id.replace(/^#kernel\/?/, "")));
	}
});
