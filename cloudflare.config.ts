import { bindings, defineConfig } from "cf/config";

export default defineConfig({
	accountId: "1dc7f5dfd6f1830ea5b903d051c6d624",
	worker: {
		name: "alexanderniebuhr-garden",
		compatibilityDate: "2026-11-08", // newest date the adapter's pinned plugin supports; raise once it pins a newer one
		entrypoint: "./src/worker.ts",
		workersDev: true,
		previewUrls: true,
		domains: ["alexanderniebuhr.garden"],
		limits: { cpuMs: 60_000 }, // default is 30000 (30 seconds)
		observability: {
			logs: {
				enabled: true,
				invocationLogs: true,
				headSamplingRate: 1,
				persist: true,
			},
			traces: { enabled: true, headSamplingRate: 1, persist: true },
		},
		env: {
			ASSETS: bindings.assets(),
			IMAGES: bindings.images({ dev: { remote: true } }),
			CF_VERSION_METADATA: bindings.versionMetadata(),
		},
	},
});
