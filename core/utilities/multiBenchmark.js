import benchmark from "./benchmark";
import nanoseconds from "./nanoseconds";

export default /**
 * Prints out the benchmark results for each code block.
 * @memberof module:utilities
 * @param {function} codeblock The code to benchmark.
 * @param {number} times The amount of times to run the benchmark.
 */ async function multiBenchmark(codeblocks, times) {
	const start = nanoseconds();
	const results = await Promise.all(
		codeblocks.map((codeblock) => benchmark(codeblock, times))
	);
	const end = nanoseconds();

	const groupName = `Benchmarked ${codeblocks.length.toLocaleString()} functions ${times.toLocaleString()} times over ${(
		end - start
	).toLocaleString()}ns.`;

	console.group(groupName);
	const mappedResults = Object.values(results).map((result) => {
		return {
			Name: result.name,
			"Median Time": `${result.median.toLocaleString()}ns`,
			"Average Time": `${result.average.toLocaleString()}ns`,
			Returns: result.returns,
			Error: result.error,
			"(Median Time)": result.median,
			"(Average Time)": result.average,
		};
	});
	const successfulResults = mappedResults.filter(
		(result) => result.Error === false
	);
	const erroredResults = mappedResults.filter((result) => !!result.Error);

	console.table(
		successfulResults
			.sort((result1, result2) => {
				if (result1["(Average Time)"] > result2["(Average Time)"]) return 1;
				if (result1["(Average Time)"] < result2["(Average Time)"]) return -1;
				return 0;
			})
			.sort((result1, result2) => {
				if (result1["(Median Time)"] > result2["(Median Time)"]) return 1;
				if (result1["(Median Time)"] < result2["(Median Time)"]) return -1;
				return 0;
			}),
		["Name", "Median Time", "Average Time", "Returns"]
	);
	if (erroredResults.length > 0) {
		console.table(erroredResults, ["Name", "Error"]);
	}

	console.groupEnd(groupName);
	return results;
}
