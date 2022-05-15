import { ipcRenderer } from "electron";

ipcRenderer.on("KERNEL_ERROR", (event, error) => {
	const typePre = Object.assign(document.createElement("pre"), {
		innerText: error.includes("kernel.asar")
			? "Kernel has caused an error."
			: "Either Kernel or the app has caused an error.",
	});
	const errorPre = Object.assign(document.createElement("pre"), {
		innerText: error,
	});
	document.body.appendChild(typePre);
	document.body.appendChild(errorPre);
	console.error(error);
});
