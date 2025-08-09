import cloudflare from '@astrojs/cloudflare';
import markdoc from '@astrojs/markdoc';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import expressiveCode from 'astro-expressive-code';
import browserslist from 'browserslist';
import { browserslistToTargets } from 'lightningcss';

export default defineConfig({
	site: 'https://alexanderniebuhr.me',
	prefetch: {
		prefetchAll: true,
	},
	security: {
		checkOrigin: true,
	},
	env: {
		schema: {},
	},
	integrations: [
		expressiveCode(),
		markdoc({
			allowHTML: true,
		}),
		sitemap(),
	],
	output: 'static',
	adapter: cloudflare(),
	vite: {
		css: {
			transformer: 'lightningcss',
			lightningcss: {
				targets: browserslistToTargets(
					/**
					 * https://browsersl.ist/
					 * https://github.com/browserslist/browserslist
					 */
					browserslist([
						'> 0.5%',
						'last 2 versions',
						'Firefox ESR',
						'not dead',
						'cover 80% in CN',
						'unreleased versions',
					]),
				),
				drafts: {
					customMedia: true,
				},
			},
		},
		build: {
			minify: false,
			cssMinify: false,
		},
	},
	compressHTML: false,
	experimental: {
		contentIntellisense: true,
		liveContentCollections: true,
		preserveScriptOrder: true,
	},
});
