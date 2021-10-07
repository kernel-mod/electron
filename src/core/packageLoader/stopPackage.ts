import broadcast from "../broadcast";
import _stopPackage from "./_stopPackage";

broadcast.on("stopPackage", (packageID: string) => {
	_stopPackage(packageID);
});

export default function stopPackage(packageID: string) {
	broadcast.emit("stopPackage", packageID);
}
