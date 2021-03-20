function gsetw(object, nodePath = "") {
	return new Promise((resolve) => {
		nodePath = nodePath.split(".").filter((node) => node.trim() !== "");

		while (
			nodePath.length > 0 &&
			object[nodePath[0]] !== null &&
			object[nodePath[0]] !== undefined
		) {
			object = object[nodePath[0]];
			nodePath.shift();
		}

		if (nodePath.length === 0) {
			return resolve(object);
		}

		Object.defineProperty(object, nodePath[0], {
			get: () => {
				return null;
			},
			set: (newObject) => {
				Object.defineProperty(object, nodePath[0], newObject);
				nodePath.shift();
				if (nodePath.length > 0) {
					return resolve(gsetw(newObject, nodePath.join(".")));
				}
				resolve(newObject);
			},
		});
	});
}

module.exports = gsetw;
