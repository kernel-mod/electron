const path = require("path");

module.exports = (mod) => {
	return path.resolve(path.join(__dirname, "..", "node_modules", mod)); 
 };