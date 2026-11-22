import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig, svgoOptimizer } from "astro/config";
import expressiveCode from "astro-expressive-code";
import browserslist from "browserslist";
import { browserslistToTargets } from "lightningcss";

export default defineConfig({
	site: "https://alexanderniebuhr.garden",
	output: "server",
	session: false,
	adapter: cloudflare({
		imageService: { build: "compile", runtime: "cloudflare-binding" },
	}),
	compressHTML: false,
	experimental: {
		clientPrerender: true,
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
	// /de/ has no page of its own and falls back to /en/, which is prerendered; Astro would
	// write that fallback as a static meta-refresh page, so keep it an HTTP 302 (_redirects)
	redirects: {
		"/de/": { status: 302, destination: "/en/" },
	},
	prefetch: {
		defaultStrategy: "hover",
	},
	integrations: [expressiveCode(), mdx(), sitemap()],
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
	},
});
