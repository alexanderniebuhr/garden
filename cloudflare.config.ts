import { bindings, defineConfig } from "cf/config";

export default defineConfig({
	accountId: "1dc7f5dfd6f1830ea5b903d051c6d624",
	worker: {
		name: "alexanderniebuhr-garden",
		compatibilityDate: "2026-11-08", // newest date the adapter's pinned plugin supports; raise once it pins a newer one
		compatibilityFlags: [
			"pipe_to_backward_propagation", // default from 2026-11-17; drop once compatibilityDate reaches it
			"enable_request_signal", // default from 2026-11-17; drop once compatibilityDate reaches it
			"global_fetch_strictly_public",
			"temporal", // default from 2026-12-01; drop once compatibilityDate reaches it
			"new_module_registry", // default from 2026-11-17; drop once compatibilityDate reaches it
		],
		entrypoint: "./src/worker.ts",
		workersDev: false,
		previewUrls: false, // Previews are served on preview.alexanderniebuhr.garden instead of workers.dev
		domains: [
			"alexanderniebuhr.garden",
			{
				hostname: "preview.alexanderniebuhr.garden",
				production: false,
				previews: true,
			},
		],
		placement: { mode: "smart" },
		limits: { cpuMs: 60_000 }, // default is 30000 (30 seconds)
		observability: {
			issues: { enabled: true },
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
			IMAGES: bindings.images(),
		},
	},
});
