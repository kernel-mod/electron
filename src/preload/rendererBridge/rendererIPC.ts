import { ipcRenderer } from "electron";

export default {
	on: (
		channel: string,
		listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void
	) => {
		return ipcRenderer.on(channel, listener);
	},
	once: (
		channel: string,
		listener: (channel: Electron.IpcRendererEvent, ...args: any[]) => void
	) => {
		return ipcRenderer.once(channel, listener);
	},
	off: (channel: string, listener: (...args: any[]) => void) => {
		return ipcRenderer.off(channel, listener);
	},
	send: (channel: string, ...args: string[]) => {
		return ipcRenderer.send(channel, ...args);
	},
	sendSync: (channel: string, ...args: string[]) => {
		return ipcRenderer.sendSync(channel, ...args);
	},
	invoke: (channel: string, ...args: string[]) => {
		return ipcRenderer.invoke(channel, ...args);
	},
};
