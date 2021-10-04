// A function that memoizes the result of the given function.
export default function memoize(func: Function): Function {
	const cache = new Map();
	return function (...args: any[]) {
		const key = JSON.stringify(args);
		if (cache.has(key)) {
			return cache.get(key);
		}
		const result = func.apply(this, args);
		cache.set(key, result);
		return result;
	};
}
