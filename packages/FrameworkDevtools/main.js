import { app } from "electron";
import installExtension, * as devtools from "electron-devtools-installer";
import fs from "fs-extra";
import path from "path";

export default class FrameworkDevtools {
	start() {
		app.on("ready", () => {
			const enabledDevtools = fs.readJSONSync(
				path.join(__dirname, "index.json")
			).options.devtools;
			for (const devtool of enabledDevtools) {
				installExtension(devtools[devtool], {
					loadExtensionOptions: { allowFileAccess: true },
					forceDownload: true,
				})
					.then((name) => this.logger.log(`Added Extension: ${name}`))
					.catch((err) => this.logger.log("An error occurred:", err));
			}
		});

		this.logger.log("This should log first.");
	}

	stop() {}
}
