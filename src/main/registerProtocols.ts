import { app, protocol } from "electron";
import fs from "fs";
import { patchedRequire } from "#kernel/core/patchers/ImportPatcher";

// Register the protocol schemes.
protocol.registerSchemesAsPrivileged([
	{ scheme: "kernel", privileges: { bypassCSP: true } },
	{
		scheme: "kernel-sync",
		privileges: { bypassCSP: true },
	},
]);

app.on("ready", () => {
	protocol.registerFileProtocol("kernel", (request, callback) => {
		const url = request.url.substr(8);
		callback({ path: url });
	});
	protocol.registerFileProtocol("kernel-sync", (request, callback) => {
		const url = request.url.substr(12);
		callback({ path: url });
	});
	// protocol.registerStringProtocol("kernel", (request, callback) => {
	// 	const url = request.url.substr(9);
	// 	const patchResult = patchedRequire(url);
	// 	callback({
	// 		mimeType: "text/javascript",
	// 		data: patchResult ?? fs.readFileSync(url, "utf8"),
	// 	});
	// });
	// protocol.registerStringProtocol("kernel-sync", (request, callback) => {
	// 	const url = request.url.substr(13);
	// 	const patchResult = patchedRequire(url);
	// 	callback({
	// 		mimeType: "text/javascript",
	// 		data: patchResult ?? fs.readFileSync(url, "utf8"),
	// 	});
	// });
});
