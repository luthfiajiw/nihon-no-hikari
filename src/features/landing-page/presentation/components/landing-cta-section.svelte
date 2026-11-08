<script lang="ts">
	import { CircleCheck } from 'lucide-svelte';
	import { viewportReveal } from '$lib/actions/viewport-reveal';
</script>

<!-- FINAL CALL TO ACTION BANNER -->
<section class="w-full bg-surface py-space-xl">
	<div class="mx-auto max-w-7xl px-gutter">
		<div
			class="relative flex flex-col items-center overflow-hidden rounded-3xl bg-primary-container p-8 text-center text-white shadow-lg sm:p-14"
			use:viewportReveal={{ direction: 'up', delay: 100 }}
			style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuArRGFkPO_5sX0e1bem_FX5vueYQIm8Wxq6-Mlh7-mo3oeV6HITx4aJW9saJjRL8y9N6qJvButA78GNmqIu1cAy5DjLIcyJOim3fcgU7EnQC0Uxzb4L4u47evqdsKxFDu2VLI8EyYv5f2QiRjmaXlij1PmT8qYoL3R7gjCg4PssTLRKDqQpjUTDbuSPUaoHAdP--0MUHE1dtm95LRMHbc3GT_VM93jnmQiRtft8-cuv'); background-size: cover; background-position: center center;"
		>
			<div class="pointer-events-none absolute inset-0 z-0 bg-gradient-to-t from-on-surface/90 via-on-surface/75 to-on-surface/60"></div>
			<div class="pointer-events-none absolute -top-20 -right-20 size-80 rounded-full bg-secondary-container/20 blur-3xl"></div>
			<div class="pointer-events-none absolute -bottom-20 -left-20 size-80 rounded-full bg-primary-container/30 blur-3xl"></div>

			<span class="relative z-10 mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-semibold text-label-sm text-white backdrop-blur-sm">
				<span>🌸</span> Mulai Langkah Pertama Hari Ini
			</span>
			<h2 class="relative z-10 mb-space-sm max-w-2xl font-display text-headline-lg font-bold tracking-tight text-white sm:text-display">
				Siap Memulai Perjalanan Bahasa Jepangmu?
			</h2>
			<p class="relative z-10 mb-space-lg max-w-xl font-body-md text-body-lg leading-relaxed text-white/90">
				Daftar sekarang tanpa kartu kredit. Akses instan ke modul pengenalan Hiragana, 100 flashcards pertama, dan bimbingan rencana belajar AI.
			</p>

			<div class="relative z-10 flex w-full max-w-md justify-center">
				<a
					class="w-full rounded-full bg-on-surface px-7 py-3.5 text-center font-label-lg text-label-lg font-bold text-surface shadow-md transition-all duration-200 hover:bg-black hover:shadow-lg sm:w-auto"
					href="/register"
				>
					Daftar Sekarang! Gratis
				</a>
			</div>

			<div class="relative z-10 mt-6 flex items-center gap-4 font-label-sm text-label-sm text-white/80">
				<span class="flex items-center gap-1">
					<CircleCheck class="size-4" /> 100% Gratis di Awal
				</span>
				<span class="flex items-center gap-1">
					<CircleCheck class="size-4" /> Tanpa Kartu Kredit
				</span>
			</div>
		</div>
	</div>
</section>
