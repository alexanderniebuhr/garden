import type { APIRoute } from "astro";

export const prerender = false;

import { getCollection } from "astro:content";
import rss from "@astrojs/rss";

export const GET = (async ({ site }) => {
	const article = await getCollection("blog");
	return rss({
		title: "Alexander Niebuhr's Garden",
		description:
			"A personal blog about web development, design, and other things I find interesting.",
		site: site || "https://alexanderniebuhr.garden",
		items: article.map((post) => ({
			title: post.data.title,
			pubDate: post.data.date,
			link: `/${post.id}/`,
		})),
	});
}) satisfies APIRoute;
