export default new Proxy(console, {
	get(target, key, receiver) {
		switch (key) {
			case "time":
			case "timeEnd":
				return function (...args) {
					return target[key].apply(console, [`[Kernel] ${args[0]}`]);
				};
			default:
				return function (...args) {
					return target[key].apply(console, ["[Kernel]", ...args]);
				};
		}
	},
});
