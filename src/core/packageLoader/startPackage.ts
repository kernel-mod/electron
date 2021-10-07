import broadcast from "../broadcast";
import _startPackage from "./_startPackage";

broadcast.on("startPackage", (packageID: string) => {
	_startPackage(packageID);
});

export default function startPackage(packageID: string) {
	broadcast.emit("startPackage", packageID);
}
