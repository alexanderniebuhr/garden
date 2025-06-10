import { component, defineMarkdocConfig, nodes } from '@astrojs/markdoc/config';

export default defineMarkdocConfig({
	nodes: {
		fence: {
			render: component('./src/components/Fence.astro'),
			attributes: {
				content: { type: 'String', required: true },
				language: { type: 'String' },
				title: { type: 'String' },
				frame: { type: 'String', matches: ['auto', 'none', 'code', 'terminal'] },
			},
		},
	},
});
