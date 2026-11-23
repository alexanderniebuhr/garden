import type { APIRoute } from "astro";

export const prerender = true;

import rss from "@astrojs/rss";
import { getPostUrl, getPublishedPosts } from "../posts";

export const GET = (async ({ site }) => {
	const posts = await getPublishedPosts();
	return rss({
		title: "Alexander Niebuhr's Garden",
		description:
			"A personal blog about web development, design, and other things I find interesting.",
		site: site || "https://alexanderniebuhr.garden",
		items: posts.map((post) => ({
			title: post.data.title,
			pubDate: post.data.date,
			link: getPostUrl(post.id),
			author: post.data.author,
			...(post.data.excerpt ? { description: post.data.excerpt } : {}),
		})),
	});
}) satisfies APIRoute;
