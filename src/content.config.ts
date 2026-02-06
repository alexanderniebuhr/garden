import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
	loader: glob({ base: "./src/content/blog", pattern: "**/*.md" }),
	schema: () =>
		z.object({
			slug: z.string(),
			title: z.string(),
			author: z.string(),
			date: z.coerce.date(),
		}),
});

export const collections = {
	blog,
};
