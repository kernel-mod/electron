import logger from "kernel/logger";

export default class ExamplePlugin {
	start() {
		logger.log("ExamplePlugin2 started.");
	}

	stop() {
		logger.log("ExamplePlugin2 stopped.");
	}
}
