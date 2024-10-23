import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const seedCollection = defineCollection({
	loader: glob({
		base: './data/seeds',
		pattern: '**/*.mdoc',
	}),
	schema: z.object({
		title: z.string().describe('Title of the seed'),
		tagline: z.string().optional(),
		maxDepthTOC: z.number().optional(),
		date: z.date(),
	}),
});

export const collections = {
	seeds: seedCollection,
};
