// TODO: Pass global and renderer cores.
import "./renderer/test";
import gsetw from "./node_modules/gsetw";
// import logger from "./core/logger";

gsetw(window, "webpackJsonp").then((newWebpackJsonp) => {
	const originalPush = { ...webpackJsonp }.push;
	newWebpackJsonp.push = ([something, modules, somethingElse]) => {
		try {
			const keys = Object.keys(modules);
			for (const key of keys) {
				const originalModule = Array.isArray(modules)
					? [...modules][key]
					: { ...modules }[key];

				modules[key] = (moduleData, exports, webpackRequire) => {
					modules[key] = originalModule;

					if (key == 22) {
						Object.defineProperty(exports, "__esModule", {
							value: !0,
						});
						exports.setLogFn = () => {};
						exports.default = class {
							log(...args) {
								console.debug(...args);
							}
							info(...args) {
								console.debug(...args);
							}
							warn(...args) {
								console.debug(...args);
							}
							error(...args) {
								console.debug(...args);
							}
							trace(...args) {
								console.debug(...args);
							}
							verbose(...args) {
								console.debug(...args);
							}
							name = "";
						};
					} else {
						originalModule(moduleData, exports, webpackRequire);
						window?.DiscordNative?.window?.setDevtoolsCallbacks?.(null, null);
					}
				};
			}
		} catch (e) {
			console.error("Something has gone horribly wrong.", e);
		}
		return originalPush(
			somethingElse ? [something, modules, somethingElse] : [something, modules]
		);
	};
});

console.log("get prenderered on lmao");
console.log("webpackJsonp", webpackJsonp);
