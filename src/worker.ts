import handler from "@astrojs/cloudflare/entrypoints/server";

const PRODUCTION_HOSTNAME = "alexanderniebuhr.garden";

export default {
	async fetch(request, env, ctx) {
		const response = await handler.fetch(request, env, ctx);
		if (new URL(request.url).hostname === PRODUCTION_HOSTNAME) {
			return response;
		}
		// custom-domain Previews don't get the noindex header that workers.dev adds;
		// static assets get it from the matching rule in public/_headers
		const noindex = new Response(response.body, response);
		noindex.headers.set("X-Robots-Tag", "noindex");
		return noindex;
	},
} satisfies ExportedHandler<Env>;
