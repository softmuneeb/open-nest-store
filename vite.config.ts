import { reactRouter } from "@react-router/dev/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { resolve } from "path";
import { fileURLToPath } from "url";

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

export default defineConfig({
	plugins: [
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
