"use strict";
// require("./preready/index.cjs");
// global.require = require;
const electron = require("electron");
import("./main/index.js").then((m) => m.load(electron));
