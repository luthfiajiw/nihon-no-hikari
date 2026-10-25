import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	envPrefix: ['VITE_'],
	cacheDir: process.env.ADMIN_SMOKE_CACHE_DIR,
	optimizeDeps: {
		// Keep the shared UI/runtime graph stable when entering a new admin route.
		include: [
			'microsoft-cognitiveservices-speech-sdk',
			'bits-ui',
			'@tanstack/svelte-form',
			'lucide-svelte',
			'svelte-dnd-action',
			'tailwind-merge',
			'tailwind-variants'
		],
		// Compile icon subpaths on demand without rebuilding the shared Svelte bundle.
		exclude: ['@lucide/svelte']
	},
	plugins: [
		tailwindcss(),
		sveltekit(),

		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			emitTsDeclarations: true
		})
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright({
							launchOptions: { channel: process.env.VITEST_BROWSER_CHANNEL || undefined }
						}),
						instances: [{ browser: 'chromium', headless: true }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**']
				}
			},

			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
