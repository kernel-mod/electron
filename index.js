const { logger } = require("./core/global");

module.exports = (injectionPath) => {
	logger.log("Loading Kernel.");

	require("./injector")(injectionPath);
};
