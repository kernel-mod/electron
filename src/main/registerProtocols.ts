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
	protocol.registerBufferProtocol("kernel", (request, callback) => {
		const url = request.url.substring(9);
		const patchResult = patchedRequire(url, true);
		callback({
			mimeType: "text/javascript",
			data: Buffer.from(patchResult ?? fs.readFileSync(url, "utf8"), "utf-8"),
		});
	});
	protocol.registerBufferProtocol("kernel-sync", (request, callback) => {
		const url = request.url.substring(14);
		const patchResult = patchedRequire(url, true);
		callback({
			mimeType: "text/javascript",
			data: Buffer.from(patchResult ?? fs.readFileSync(url, "utf8"), "utf-8"),
		});
	});
});
