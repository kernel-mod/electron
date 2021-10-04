let loadedPackages = {};

export default {
	get: (key: string) => {
		return loadedPackages[key] ?? loadedPackages;
	},
	set: (key: string, value: any) => {
		loadedPackages[key] = value;
	},
};
