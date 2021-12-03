export default function uuid(
	dontMatch: (uuid: string) => boolean = () => false
): string {
	let uuid: string;
	do {
		uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
			const r = (Math.random() * 16) | 0;
			const v = c === "x" ? r : (r & 0x3) | 0x8;
			return v.toString(16);
		});
	} while (dontMatch(uuid));
	return uuid;
}
