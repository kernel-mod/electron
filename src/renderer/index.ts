// This will probably change when the core is moved to a separate repository.
import type Ogre from "../core/packageLoader/Ogre";

(async () => {
	const packageInstances = {};

	kernel.packages.events.on("startPackage", (packageID) => {
		packageInstances[packageID]?.start?.();
	});
	kernel.packages.events.on("stopPackage", (packageID) => {
		packageInstances[packageID]?.stop?.();
	});

	const ogre: Ogre = kernel.packages.getOgre();

	for (const layer of ogre) {
		for (const [id, pack] of Object.entries(layer)) {
			if (kernel.packages.hasRendererScript(id)) {
				let script = await import(
					`${kernel.importProtocol}://${pack.path}/renderer.js`
				);
				script = !!script.default ? script.default : script;
				packageInstances[id] = script;
				script.start?.();
			}
		}
	}

	kernel.sendFinished();
})();

export {};
