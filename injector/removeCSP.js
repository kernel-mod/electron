const { logger } = require("../core/global");
logger.log("Removing CSP.");

const { session } = require("electron");

session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
	// Only delete the CSP headers if they exist.
	if (details.responseHeaders["content-security-policy-report-only"]) {
		delete details.responseHeaders["content-security-policy-report-only"];
	}
	if (details.responseHeaders["content-security-policy"]) {
		delete details.responseHeaders["content-security-policy"];
	}
	callback({ cancel: false, responseHeaders: details.responseHeaders });
});
