// TODO: Pass global and renderer cores.
import "./test";
import gsetw from "../node_modules/gsetw/index.mjs";
import React from "./react.production.min.js";
import ReactDOM from "./react-dom.production.min.js";

import Injector from "kernel/injector";

window.Injector = Injector;

console.log(React);
console.log("-".repeat(30));
console.log(ReactDOM);
// import logger from "kernel/logger";

let patchedPush = false;
let replacedReact = false;
let replacedReactDOM = false;

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
						// console.log(exports);
						if (
							!replacedReact &&
							moduleData.exports?.createElement &&
							moduleData.exports?.PureComponent
						) {
							replacedReact = true;
							moduleData.exports = React;
							console.log("Found React!", exports.exports);
						} else if (
							!replacedReactDOM &&
							moduleData.exports?.render &&
							moduleData.exports?.createPortal
						) {
							replacedReactDOM = true;
							ReactDOM.render = (target, element) =>
								ReactDOM.unstable_createRoot(element).render(target);
							moduleData.exports = ReactDOM;
							console.log("Found ReactDOM!", exports.exports);
						}

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
console.log("w1ebpackJsonp", webpackJsonp);
