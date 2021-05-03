import average from "./average";
import median from "./median";
import nanoseconds from "./nanoseconds";

export default /**
 * @param {function} codeblock The code to benchmark.
 * @param {number} times The amount of times to run the benchmark.
 * @memberof module:utilities
 * @returns {Promise} A Promise that resolves when the benchmark is completed.
 */ function benchmark(codeblock, times) {
	return new Promise((resolve) => {
		const pre = codeblock.pre ?? (() => {});
		delete codeblock.pre;
		const post = codeblock.post ?? (() => {});
		delete codeblock.post;

		const name = Object.keys(codeblock)[0];

		codeblock = codeblock[Object.keys(codeblock)[0]];

		let promises = [];

		for (let i = 0; i < times; i++) {
			promises.push(
				new Promise((resolve) => {
					let returns, start, end;
					try {
						pre();
						start = nanoseconds();
						returns = codeblock();
						end = nanoseconds();
						post();
					} catch (e) {
						resolve({ returns, time: 0, error: e });
					}
					resolve({ returns, time: end - start, error: false });
				})
			);
		}

		Promise.all(promises).then((allReturns) => {
			const finalTimes = allReturns.map((r) => r.time);
			resolve({
				name,
				average: average(finalTimes),
				median: median(finalTimes),
				error: allReturns[0].error,
				returns: allReturns[0].returns,
			});
		});
	});
}
