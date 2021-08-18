export default (currentFile) => {
	return {
		minified: true,
		comments: false,
		sourceFileName: currentFile,
		sourceMaps: "inline",
		sourceType: "module",
	};
};
