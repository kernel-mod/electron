// TODO: Pass global and renderer cores.
import Dexie from "../node_modules/dexie/dist/dexie.mjs";
import "./test";
// import gsetw from "../core/global/logger/index";

function gsetw(object, nodePath, before = false) {
	return new Promise((resolve, reject) => {
		if (typeof object !== "object") reject("Non-object in tree.");
		if (typeof nodePath !== "string") reject("Node path is not a string.");
		nodePath = nodePath.split(".").filter((node) => node.trim() !== "");

		while (
			nodePath.length > 0 &&
			object[nodePath[0]] !== null &&
			object[nodePath[0]] !== undefined
		) {
			if (typeof object !== "object") reject("Non-object in tree.");
			object = object[nodePath[0]];
			nodePath.shift();
		}

		if (typeof object !== "object") reject("Non-object in tree.");

		if (nodePath.length === 0) {
			return resolve(object);
		}

		Object.defineProperty(object, nodePath[0], {
			get: () => {
				return undefined;
			},
			set: (newObject) => {
				function dispatch() {
					nodePath.shift();
					if (nodePath.length > 0) {
						return resolve(gsetw(newObject, nodePath.join(".")));
					}
					resolve(newObject);
				}
				if (before) dispatch();
				Object.defineProperty(object, nodePath[0], { value: newObject });
				if (!before) dispatch();
			},
			configurable: true,
			enumerable: true,
		});
	});
}

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
						exports.setLogFn = () => { };
						exports.default = class {
							log() { }
							info() { }
							warn() { }
							error() { }
							trace() { }
							verbose() { }
							name = "";
						};
					} else {
						originalModule(moduleData, exports, webpackRequire);
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
