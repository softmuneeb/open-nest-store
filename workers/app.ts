import { createRequestHandler } from "react-router";

declare module "react-router" {
	export interface AppLoadContext {
		cloudflare: {
			env: Env;
			ctx: ExecutionContext;
		};
	}
}

const requestHandler = createRequestHandler(
	() => import("virtual:react-router/server-build"),
	import.meta.env.MODE,
);

export default {
	fetch(request, env, ctx) {
		// Silently return 404 for browser-internal probe URLs that React Router
		// doesn't know about (e.g. Chrome DevTools auto-discovery, Apple pay, etc.).
		// Without this they flood the terminal with "No route matches URL" errors.
		const url = new URL(request.url);
		if (url.pathname.startsWith('/.well-known/')) {
			return new Response(null, { status: 404 });
		}
		return requestHandler(request, {
			cloudflare: { env, ctx },
		});
	},
} satisfies ExportedHandler<Env>;
