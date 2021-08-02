import gsetw from "gsetw";

export default class NoDiscordLogout {
	start() {
		gsetw(global, "DiscordNative").then(() => {
			DiscordNative.window.setDevtoolsCallbacks(
				() => {},
				() => {}
			);
		});
	}
}
