import logger from "kernel/logger";

export default class ExamplePlugin {
	start() {
		logger.log("ExampleDependency started.");
	}

	stop() {
		logger.log("ExampleDependency stopped.");
	}
}
