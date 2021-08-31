import { contextBridge } from "electron";

import { default as ipc } from "./rendererIPC";

contextBridge.exposeInMainWorld("kernel", {
	ipc,
});
