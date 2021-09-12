export default interface PackageInfo {
	name: string;
	id: string;
	path: string;
	version?: string;
	dependencies?: string[];
}
