import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	compilerOptions: {
		runes: ({ filename }) => filename.split(/[/\\]/).includes('node_modules') ? undefined : true
	},
	kit: {
		adapter: adapter(),
		alias: {
			"$lib": "./src/lib",
			"$lib/*": "./src/lib/*",
			"$features": "./src/features",
			"$features/*": "./src/features/*"
		}
	}
};

export default config;
