import { ipcRenderer } from "electron";

export default {
	on: (
		event: string,
		listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void
	) => {
		return ipcRenderer.on(event, listener);
	},
	once: (
		event: string,
		listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void
	) => {
		return ipcRenderer.once(event, listener);
	},
	off: (event: string, listener: (...args: any[]) => void) => {
		return ipcRenderer.off(event, listener);
	},
	send: (event: string, ...args: string[]) => {
		return ipcRenderer.send(event, ...args);
	},
	sendSync: (event: string, ...args: string[]) => {
		return ipcRenderer.sendSync(event, ...args);
	},
	invoke: (event: string, ...args: string[]) => {
		return ipcRenderer.invoke(event, ...args);
	},
};
