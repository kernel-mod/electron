// TODO: Pass global and renderer cores.

import "./test";
import injector from "kernel/injector";
import * as webpack from "kernel/webpack";

import gsetw from "gsetw";

import benchmark from "kernel/utilities/benchmark";
import multiBenchmark from "kernel/utilities/multiBenchmark";

import React from "./react.production.min";
import ReactDOM from "./react-dom.profiling.min";

window.React = React;
window.ReactDOM = ReactDOM;

window.kernel = { injector, webpack, benchmark, multiBenchmark };

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

					originalModule(moduleData, someExport, webpackRequire);

					if (
						moduleData.exports?.createElement &&
						moduleData.exports?.PureComponent
					) {
						moduleData.exports = React;
					} else if (
						moduleData.exports?.render &&
						moduleData.exports?.createPortal
					) {
						// ReactDOM.render = (target, element) =>
						// 	ReactDOM.createRoot(element).render(target);
						moduleData.exports = ReactDOM;
					}

					window?.DiscordNative?.window?.setDevtoolsCallbacks?.(null, null);

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

console.log("Source maps log.");
