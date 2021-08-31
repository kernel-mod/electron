import * as path from "path";

export default function resolve(url: string) {
	if (path.isAbsolute(url)) {
		url = require.resolve(url);
	} else {
		url = require.resolve(path.join(__dirname, url));
	}

	return url;
}
