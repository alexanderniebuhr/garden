import { getCollection } from "astro:content";

export function getPublishedPosts(locale?: string) {
	return getCollection(
		"blog",
		({ data, id }) => !data.draft && (!locale || id.startsWith(`${locale}/`)),
	);
}
