import { getCollection } from "astro:content";

export async function getPublishedPosts(locale?: string) {
	const posts = await getCollection(
		"blog",
		({ data, id }) => !data.draft && (!locale || id.startsWith(`${locale}/`)),
	);
	return posts.sort(
		(a, b) =>
			b.data.date.valueOf() - a.data.date.valueOf() || a.id.localeCompare(b.id),
	);
}

export function getPostUrl(postId: string) {
	return `/${postId}/`;
}
