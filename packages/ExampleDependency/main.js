import logger from "kernel/logger";

export default class ExamplePlugin {
	start() {
		logger.log("ExamplePlugin started.");
	}

	stop() {
		logger.log("ExamplePlugin stopped.");
	}
}
