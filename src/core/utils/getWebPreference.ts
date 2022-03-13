const webFrame = (process as any)._linkedBinding("electron_renderer_web_frame");

let getWebPreference = (id: string) => null;

if (typeof webFrame.getWebPreference === "function") {
    getWebPreference = (id: string) => webFrame.getWebPreference(window, id);
} else if (typeof webFrame.mainFrame?.getWebPreference === "function") {
    getWebPreference = (id: string) => webFrame.mainFrame.getWebPreference(id);
}
 
export default getWebPreference;