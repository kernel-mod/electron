const { logger } = require("../core/global");
logger.log("Removing CSP.");

const { session } = require("electron");

const headers = [
	"content-security-policy-report-only",
	"content-security-policy",
	"x-frame-options",
];

session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
	// Only delete the headers if they exist.
	for (const header of headers) {
		if (details.responseHeaders[header]) {
			delete details.responseHeaders[header];
		}
	}
	callback({ cancel: false, responseHeaders: details.responseHeaders });
});
