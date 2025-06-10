import cloudflare from '@astrojs/cloudflare';
import markdoc from '@astrojs/markdoc';
import expressiveCode from 'astro-expressive-code';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

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
		expressiveCode({ themes: ['poimandres'], tabWidth: 2 }),
		markdoc({
			allowHTML: true,
		}),
		sitemap(),
	],
	output: 'hybrid',
	adapter: cloudflare(),
	vite: {
		css: {
			transformer: 'lightningcss',
			lightningcss: {
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
	experimental: {
		contentIntellisense: true,
		serverIslands: true,
	},
});
