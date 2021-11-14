import * as requirePatcher from "../core/patchers/RequirePatcher";
import path from "path";

requirePatcher.patch("kernel-aliases", (id) => {
	if (id.startsWith("#kernel")) {
		return require(path.join(__dirname, "..", id.replace(/^#kernel\/?/, "")));
	}
});
