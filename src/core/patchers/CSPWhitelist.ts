import { session } from "electron";

export type UnwhitelistFunction = () => boolean;

export const patches: {
	[id: string]: RegExp;
} = {};

const headers = [
	"content-security-policy-report-only",
	"content-security-policy",
	"x-frame-options",
];

session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
	let whitelisted = false;
	const patchMatchers = Object.values(patches);
	for (let i = 0; i < patchMatchers.length; i++) {
		if (patchMatchers[i].test(details.url)) {
			whitelisted = true;
			break;
		}
	}
	if (whitelisted) {
		// Only delete the headers if they exist.
		for (const header of headers) {
			if (details.responseHeaders[header]) {
				delete details.responseHeaders[header];
			}
		}
	}
	callback({ cancel: false, responseHeaders: details.responseHeaders });
});

export function whitelist(id: string, urlMatcher: RegExp): UnwhitelistFunction {
	if (patches[id]) throw `Whitelist "${id}" already exists.`;
	patches[id] = urlMatcher;
	return () => unwhitelist(id);
}

export function unwhitelist(id: string): boolean {
	return delete patches[id];
}
