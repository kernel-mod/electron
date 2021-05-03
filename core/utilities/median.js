export default /**
 * @param {number[]} array An array of numbers.
 * @memberof module:utilities
 * @returns {number} The median of the numbers in the array.
 */ function median(array) {
	const L = array.length,
		halfL = L / 2;
	if (L % 2 == 1) return quickselect(array, halfL);
	else return 0.5 * (quickselect(array, halfL - 1) + quickselect(array, halfL));
}

function quickselect(array, k) {
	// Select the kth element in arr
	// arr: List of numerics
	// k: Index
	// return: The kth element (in numerical order) of arr
	if (array.length == 1) return array[0];
	else {
		const pivot = array[0];
		const lows = array.filter((e) => e < pivot);
		const highs = array.filter((e) => e > pivot);
		const pivots = array.filter((e) => e == pivot);
		if (k < lows.length)
			// the pivot is too high
			return quickselect(lows, k);
		else if (k < lows.length + pivots.length)
			// We got lucky and guessed the median
			return pivot;
		// the pivot is too low
		else return quickselect(highs, k - lows.length - pivots.length);
	}
}
