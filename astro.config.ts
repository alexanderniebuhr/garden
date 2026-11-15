import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, logHandlers, svgoOptimizer } from "astro/config";
import expressiveCode from "astro-expressive-code";
import browserslist from "browserslist";
import { browserslistToTargets } from "lightningcss";

export default defineConfig({
	site: "https://alexanderniebuhr.garden",
	output: "server",
	session: false,
	logger: logHandlers.json(),
	adapter: cloudflare({
		imageService: "cloudflare-binding",
	}),
	compressHTML: false,
	experimental: {
		clientPrerender: true,
		incrementalBuild: true,
		contentIntellisense: true,
		svgOptimizer: svgoOptimizer(),
	},
	i18n: {
		locales: ["en", "de"],
		defaultLocale: "en",
		routing: {
			prefixDefaultLocale: true,
			fallbackType: "redirect",
			redirectToDefaultLocale: false,
		},
		fallback: {
			de: "en",
		},
	},
	prefetch: {
		defaultStrategy: "hover",
	},
	integrations: [expressiveCode(), sitemap()],
	devToolbar: {
		enabled: false,
	},
	vite: {
		css: {
			transformer: "lightningcss",
			lightningcss: {
				targets: browserslistToTargets(browserslist()),
				drafts: { customMedia: true },
			},
		},
		build: {
			minify: false,
			cssMinify: false,
		},
		plugins: [tailwindcss()],
	},
});
