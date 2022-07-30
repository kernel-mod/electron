import asar from "asar";
import fs from "fs";
import path from "path";
import { defineConfig } from "vite";

function base(...dirs) {
	return path.join(__dirname, ...dirs);
}

export default defineConfig({
	resolve: {
		alias: [
			{ find: "#kernel", replacement: base("src") },
			{
				find: /#kernel\/(.+)/,
				replacement: base("src", "$1"),
			},
		],
	},
	mode: "node",
	build: {
		target: "es2017",
		outDir: "transpiled",
		rollupOptions: {
			input: {
				// This includes the main folder.
				index: "src/index.ts",
				// All the rest of the folders that might not be imported from the main folder.
				core: "src/core/index.ts",
				preload: "src/preload/index.ts",
				renderer: "src/renderer/index.ts",
				ui: "src/ui/index.ts",
			},
			external: ["electron"],
			output: {
				entryFileNames: (chunkInfo) => {
					// Make sure entries in `input` are index.js files.
					if (chunkInfo.isEntry) {
						return "index.js";
					}
					// Otherwise use the default name.
					return `${chunkInfo.name}.js`;
				},
				preserveModules: true,
				preserveModulesRoot: "src",
				format: "esm",
				exports: "named",
			},
			preserveEntrySignatures: "strict",
		},
		sourcemap: "hidden",
		watch: {},
	},
	plugins: [
		{
			name: "asar-packer",
			async closeBundle() {
				if (fs.existsSync(base("dist")))
					fs.rmSync(base("dist"), { recursive: true });

				await asar.createPackage(
					base("transpiled"),
					base("dist", "kernel.asar")
				);

				const stats = fs.statSync(base("dist", "kernel.asar"));
				console.log("\nkernel.asar");
				console.log(`	Size: ${(stats.size / 1024).toLocaleString()} KB`);
				console.log(
					`	Files: ${asar
						.listPackage(base("dist", "kernel.asar"))
						.length.toLocaleString()}`
				);
			},
		},
		// TODO: Add a plugin for processing Electron window frontends.
	],
});
