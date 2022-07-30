import { app, Menu, shell, Tray } from "electron";
import path from "path";
import fs from "fs";
import { getPackagesPath } from "../../core/packageLoader";

// The old Kernel loader has a package name of "kernel". If it exists we use the file name of what ran it.
const appName =
	app.getName() === "kernel" ? path.basename(process.argv0) : app.getName();
const title = `Kernel - ${appName}`;

const kernelPackage = JSON.parse(
	fs.readFileSync(path.join(__dirname, "..", "..", "package.json"), "utf8")
);

app.on("ready", async () => {
	// Get the icon of the app from the file that ran it and use that as the icon.
	// Fall back to the Kernel logo.
	const icon = await app.getFileIcon(process.argv0);
	const tray = new Tray(icon ?? path.join(__dirname, "ui", "Tray", "icon.png"));

	const contextMenu = Menu.buildFromTemplate([
		{ label: `${appName} v${app.getVersion()}`, type: "normal" },
		{ label: `Kernel v${kernelPackage.version}`, type: "normal" },
		{ type: "separator" },
		{
			label: "Kernel",
			type: "submenu",
			submenu: [
				{
					label: "Open Kernel Folder",
					type: "normal",
					click: () => {
						// This should be the Kernel ASAR.
						shell.showItemInFolder(path.join(__dirname, "..", ".."));
					},
				},
				{
					label: "Open Packages Folder",
					type: "normal",
					click: () => {
						shell.openExternal(getPackagesPath());
					},
				},
				{
					label: "Open Storage Folder",
					type: "normal",
					click: () => {
						shell.openExternal(getPackagesPath());
					},
				},
				{ label: "Settings", type: "normal" },
			],
		},
		{
			label: `${appName}`,
			type: "submenu",
			submenu: [
				{
					label: "Open Folder",
					type: "normal",
					click: () => {
						shell.showItemInFolder(process.argv0);
					},
				},
				{ label: "Kill", type: "normal", click: () => app.quit() },
			],
		},
	]);
	tray.setToolTip(title);
	tray.setContextMenu(contextMenu);
	tray.on("click", () => {
		// TODO: Open settings.
		tray.popUpContextMenu();
	});
});
