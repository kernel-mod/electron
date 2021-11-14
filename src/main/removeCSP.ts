import { session } from "electron";
import Logger from "#kernel/core/Logger";

Logger.log("Removing CSP.");

const headers = [
	"content-security-policy-report-only",
	"content-security-policy",
	"x-frame-options",
];

session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
	// TODO: Add an API for registering URLs that get bypassed.
	// Only delete the headers if they exist.
	for (const header of headers) {
		if (details.responseHeaders[header]) {
			delete details.responseHeaders[header];
		}
	}
	callback({ cancel: false, responseHeaders: details.responseHeaders });
});
