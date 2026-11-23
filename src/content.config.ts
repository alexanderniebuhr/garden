import { defineCollection, reference } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { POST_STATES } from "./states";

const blog = defineCollection({
	loader: glob({
		base: "./src/content/blog",
		pattern: "**/*.{md,mdx}",
		deferRender: true,
	}),
	schema: ({ image }) =>
		z.object({
			slug: z.string(),
			title: z.string(),
			author: z.string(),
			date: z.coerce.date(),
			state: z.enum(POST_STATES),
			cover: image(),
			coverAlt: z.string(),
			excerpt: z.string().optional(),
			draft: z.boolean().default(false),
			related: z.array(reference("blog")).default([]),
		}),
});

export const collections = {
	blog,
};
