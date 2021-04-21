import * as utilities from '../utilities';

const cc = { ...console };

export class Logger {
	labels = [{ name: "Kernel" }];
	constructor({ labels = [] } = {}) {
		this.labels = [...this.labels, ...labels];
	}

	log(...args) {
		cc.log(
			...this.createArguments({
				args,
			})
		);
	}
	warn(...args) {
		cc.warn(
			...this.createArguments({
				backgroundColor: "#f5bd00",
				args,
			})
		);
	}
	error(...args) {
		return cc.error(
			...this.createArguments({
				backgroundColor: "#eb3941",
				args,
			})
		);
	}
	// log(...args) {
	// 	cc.log(...this.createArguments(...args));
	// }
	// log(...args) {
	// 	cc.log(...this.createArguments(...args));
	// }
	createArguments({
		color = "#242424",
		backgroundColor = "#DBDBDB",
		args = [],
	} = {}) {
		let newArgs = [];
		if (utilities.processLocation() === "MAIN") {
			return [...this.labels.map((label) => `[${label.name}]`), ...args];
		}

		let labels = [];

		for (const label of this.labels) {
			labels.push(label.name);
		}
		newArgs = ["%c" + labels.join("%c %c") + "%c " + args.join(" ")];
		for (const label of this.labels) {
			newArgs.push(
				`color: ${label.color ?? color}; background-color: ${
					label.backgroundColor ?? backgroundColor
				}; font-family: default; padding-left: 3px; padding-right: 3px; border-radius: 2px; font-weight: bold; user-select: none;`
			);
			newArgs.push("");
		}

		return newArgs;
	}
};

export default new Logger();