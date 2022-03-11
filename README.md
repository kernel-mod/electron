# Kernel

A super small and fast Electron client mod with the most capability.

## Community

Join on [Discord](https://discord.gg/8mPTjTZ4SZ) or [Matrix](https://matrix.to/#/!iWdiwStUmqwDcNfYbG:bigdumb.gq?via=bigdumb.gq&via=catvibers.me&via=matrix.org).

## Installation

Get the [CLI installer](https://github.com/kernel-mod/installer-cli) and run it.

This will be easier _eventually_, don't worry. But making the mod more functional and easier for developers is a high priority.

First of all, you need to download Kernel. You can either download [the latest prebuilt](https://github.com/kernel-mod/electron/releases), or you can build it by yourself (more info later on).

Every Electron app (that I've seen so far) has a folder where the Electron binary is stored. This main folder is usually in `AppData/Local` on Windows. In that folder there's another folder usually in `resources` called `app`.

Sometimes this `app` folder is a file and is called `app.asar` instead.

If `app` is a folder, rename it to `app-original` and create a new folder called `app`. If it's `app.asar` just create the new `app` folder.

The new `app` folder you made tricks Electron into loading Kernel's code first. Kernel then starts up and loads your packages, then it starts the original app.

### `app` Folder Contents

Place these in the new `app` folder you made. Don't forget to change the `"location"` property in `package.json`.

#### `index.js`

```js
const path = require("path");
require(path.join(
	require(path.join(__dirname, "package.json")).location,
	"kernel.asar"
));
```

#### `package.json`

```json
{
	"name": "kernel",
	"main": "index.js",
	"location": "THE PATH TO YOUR KERNEL DISTRO FOLDER"
}
```

## Building From Source

It's super easy. I recommend making a `kernel` folder to place these in.

> Yes, [PNPM](https://github.com/pnpm/pnpm) is _required_ as it's used in the build script. It's faster and uses less drive space anyway so if you aren't using it I highly recommend it.

```bash
git clone https://github.com/kernel-mod/browser
cd browser
pnpm i
cd ..

git clone https://github.com/kernel-mod/electron
cd electron
pnpm i
pnpm run build
```

Why two repos? This means Kernel will _eventually_ be able to run as a browser extension.

Your built Kernel distro will be at `kernel/electron/dist/kernel.asar`.

So if you want to point your Kernel distro location straight to it you would use `"location": "C:/Users/YourName/GitHub/kernel/electron/dist"`.

## Packages

> This may be subject to change.

Packages are stored in a `packages` folder that has an arbitrary height on your filesystem's tree. Even if your packages folder is three levels above `kernel.asar` it'll find it.

They are loaded in all contexts. Main, preload, and renderer. This means Kernel allows packages to do things that no other Electron mod does.

They can do anything you can do in a normal Electron app including making new BrowserWindows, patching the BrowserWindow as a whole, and replacing frameworks to name a small fraction.

### Structure

Each package has an `index.json` file that looks something like this. Dependencies will always load before the package unless you make it cyclical.

```json
{
	"name": "Package Name",
	"id": "PackageID",
	"dependencies": ["AnyIDs", "OfOtherPackages"]
}
```

Packages are written in CommonJS, but there will be a template later that lets you write them in ESModules and alias functions from Kernel itself.

To load a package in a specific context you simply create a file and name it `main.js`, `preload.js`, or `renderer.js`. All of these files are optional, only the `index.json` file is required. Kernel doesn't even care if you have none of them, but I do.

All of the context files look the same, except the renderer has no Node access and uses ESModules.

`main.js` `preload.js`

```js
const path = require("path");

module.exports = class PackageName {
	start() {
		console.log("Package loaded!", path);
	}
};
```

`renderer.js`

```js
export default class PackageName {
	start() {
		console.log("Package loaded!", path);
	}
}
```
