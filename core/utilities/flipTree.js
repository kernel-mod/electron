// export default function flipTree(object) {
// 	return Object.entries(object).reduce((acc, [innerKey, obj]) => {
// 		if (Object.entries(obj).length === 0) {
// 			acc[innerKey] = obj;
// 		} else {
// 			Object.entries(obj).forEach(([outerKey, val]) => {
// 				acc[outerKey] =
// 					typeof acc[outerKey] !== "object" ? {} : acc[outerKey] ?? {};
// 				acc[outerKey][innerKey] = typeof val === "object" ? flipTree(val) : val;
// 			});
// 		}
// 		return acc;
// 	}, {});
// }

export default function flipTree(object) {
	var result = {};

	function setValue(target, path, value) {
		var last = path.pop();
		path.reduce((o, k) => (o[k] = o[k] || {}), target)[last] = value;
	}

	function iter(o, p) {
		if (o && typeof o === "object") {
			Object.keys(o).forEach((k) => iter(o[k], [...p, k]));
			return;
		}
		p.unshift(p.pop());
		setValue(result, p, o);
	}

	iter(object, []);
	return result;
}
