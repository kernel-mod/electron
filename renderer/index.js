// TODO: Pass global and renderer cores.

// import "./test";
import gsetw from "../node_modules/gsetw/index.mjs";
import React from "./react.production.min.js";
import ReactDOM from "./react-dom.production.min.js";

import injector from "kernel/injector";
import * as webpack from "kernel/webpack";

import benchmark from "kernel/utilities/benchmark";
import multiBenchmark from "kernel/utilities/multiBenchmark";

window.kernel = { injector, webpack, benchmark, multiBenchmark };

let replacedReact = false;
let replacedReactDOM = false;

// TODO: Figure out what `something`, `somethingElse`, and `someExport` are for.
gsetw(window, "webpackJsonp").then((newWebpackJsonp) => {
	const originalPush = { ...webpackJsonp }.push;
	newWebpackJsonp.push = ([something, modules, somethingElse]) => {
		try {
			const keys = Object.keys(modules);
			const originalModules = Array.isArray(modules)
				? [...modules]
				: { ...modules };

			for (const key of keys) {
				const originalModule = originalModules[key];

				modules[key] = (moduleData, someExport, webpackRequire) => {
					modules[key] = originalModule;

					if (key == 22) {
						Object.defineProperty(someExport, "__esModule", {
							value: !0,
						});
						someExport.setLogFn = () => {};
						someExport.default = class {
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
						originalModule(moduleData, someExport, webpackRequire);
						if (
							!replacedReact &&
							moduleData.exports?.createElement &&
							moduleData.exports?.PureComponent
						) {
							replacedReact = true;
							moduleData.exports = React;
						} else if (
							!replacedReactDOM &&
							moduleData.exports?.render &&
							moduleData.exports?.createPortal
						) {
							replacedReactDOM = true;
							ReactDOM.render = (target, element) =>
								ReactDOM.unstable_createRoot(element).render(target);
							moduleData.exports = ReactDOM;
						}

						window?.DiscordNative?.window?.setDevtoolsCallbacks?.(null, null);
					}

					webpack.database.importModule(moduleData.exports, moduleData.i);
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
