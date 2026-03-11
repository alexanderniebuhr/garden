import { defineEcConfig } from "astro-expressive-code";

export default defineEcConfig({
	tabWidth: 2,
	shiki: {
		bundledLangs: ["typescript"],
		engine: "javascript",
	},
});
