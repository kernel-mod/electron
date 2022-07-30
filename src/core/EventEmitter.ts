class EventEmitter {
	listeners: { [key: string]: Function[] } = {};

	on(eventName: string, listener: (...args: any[]) => any) {
		if (this.listeners[eventName] == undefined) {
			this.listeners[eventName] = [];
		}
		this.listeners[eventName].push(listener);
	}

	once(eventName: string, listener: (...args: any[]) => any) {
		const onceListener = (...args: any[]) => {
			listener(...args);
			this.off(eventName, onceListener);
		};
		this.on(eventName, onceListener);
	}

	off(eventName: string, listener: (...args: any[]) => any) {
		if (this.listeners[eventName] == undefined) {
			return;
		}
		const listeners = this.listeners[eventName];
		for (let i = 0; i < listeners.length; i++) {
			if (listeners[i] == listener) {
				listeners.splice(i, 1);
				break;
			}
		}
	}

	emit(eventName: string, ...args: any[]) {
		if (this.listeners[eventName] == undefined) {
			return;
		}
		const listeners = this.listeners[eventName];
		for (let i = 0; i < listeners.length; i++) {
			listeners[i](...args);
		}
	}
}

export default EventEmitter;
