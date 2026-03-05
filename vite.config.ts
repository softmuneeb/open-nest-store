import { reactRouter } from "@react-router/dev/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type Plugin } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { resolve } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";
import { EventEmitter } from "events";

// Atlas replica sets create 3+ topology monitors that each register timeout
// listeners, easily hitting Node's default limit of 10. Raise it once here
// so dev-server logs stay clean without disabling the check entirely.
EventEmitter.defaultMaxListeners = 25;

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// Absolute path to the npm `punycode` package's main file.
// tr46 (pulled in by whatwg-url → mongodb-connection-string-url → mongodb)
// does require("punycode/") — the trailing-slash CJS form that esbuild
// treats as an external Node.js built-in, leaving it as a dynamic
// require() that fails at runtime in Cloudflare Workers workerd.
// We resolve it via a plugin so esbuild inlines the content instead.
const punycodeFile = resolve(__dirname, "node_modules/punycode/punycode.js");

/** esbuild plugin: resolve `require("punycode/")` to the npm package file */
const fixPunycodePlugin = {
	name: "fix-punycode-trailing-slash",
	setup(build: { onResolve: (opts: { filter: RegExp }, cb: () => { path: string }) => void }) {
		build.onResolve({ filter: /^punycode\/$/ }, () => ({ path: punycodeFile }));
	},
};

/**
 * Vite plugin: verify MongoDB connectivity before the dev server starts
 * accepting requests. Reads MONGODB_URI from .dev.vars (same file that
 * `react-router dev` / wrangler passes to the worker via --env-file).
 *
 * Exits the process with a clear error message if the cluster is unreachable,
 * so you get instant feedback instead of mysterious 500s in the browser.
 */
function checkMongoPlugin(): Plugin {
	return {
		name: "check-mongodb",
		apply: "serve", // dev server only
		async buildStart() {
			const devVarsPath = path.resolve(process.cwd(), ".dev.vars");
			let mongoUri = "";

			try {
				const content = fs.readFileSync(devVarsPath, "utf-8");
				const match = content.match(/MONGODB_URI\s*=\s*["']?([^\s"'\n]+)["']?/);
				if (match) mongoUri = match[1];
			} catch {
				// .dev.vars missing — warning only, worker will surface the error later
				console.warn("\n⚠  .dev.vars not found — MONGODB_URI is unset\n");
				return;
			}

			if (!mongoUri) {
				console.warn("\n⚠  MONGODB_URI not set in .dev.vars — database features will fail\n");
				return;
			}

			console.log("\n🔌  Verifying MongoDB connection…");
			try {
				const { MongoClient } = await import("mongodb");
				const client = new MongoClient(mongoUri, {
					serverSelectionTimeoutMS: 8_000,
					connectTimeoutMS: 8_000,
				});
				await client.connect();
				await client.close();
				console.log("✅  MongoDB connected successfully\n");
			} catch (err: unknown) {
				const msg = err instanceof Error ? err.message : String(err);
				console.error(`\n❌  MongoDB connection failed: ${msg}`);
				console.error("    Fix MONGODB_URI in .dev.vars or ensure the cluster is reachable, then restart.\n");
				process.exit(1);
			}
		},
	};
}

export default defineConfig({
	plugins: [
		checkMongoPlugin(),
		cloudflare({ viteEnvironment: { name: "ssr" } }),
		tailwindcss(),
		reactRouter(),
		tsconfigPaths(),
	],
	environments: {
		ssr: {
			optimizeDeps: {
				esbuildOptions: {
					plugins: [fixPunycodePlugin],
				},
			},
		},
	},
});
