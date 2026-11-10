<script lang="ts">
	import { Brain, CircleCheck, RefreshCw, Volume2 } from 'lucide-svelte';
	import { viewportReveal } from '$lib/actions/viewport-reveal';

	let {
		activeCategory = $bindable('Kata Keterangan'),
		isAudioPlaying,
		playDemoAudio
	}: {
		activeCategory?: 'all' | 'Kata Keterangan' | 'Kata Benda' | 'Kata Kerja';
		isAudioPlaying: boolean;
		playDemoAudio: () => void;
	} = $props();
</script>

<!-- FEATURE 2: FLASHCARDS KOSAKATA CERDAS (SRS) -->
<section class="w-full scroll-mt-24 bg-surface py-space-xl" id="kosakata">
	<div class="mx-auto max-w-7xl px-gutter">
		<!-- Header with Filter Chips -->
		<div class="mb-space-lg flex flex-col justify-between gap-space-md md:flex-row md:items-end" use:viewportReveal={{ direction: 'up' }}>
			<div class="max-w-2xl">
				<div class="mb-space-sm inline-flex items-center gap-1.5 rounded-full bg-secondary-fixed px-3 py-1 font-semibold text-label-sm text-on-secondary-fixed">
					<Brain class="size-4" />
					Spaced Repetition System (SRS)
				</div>
				<h2 class="mb-2 font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">
					Flashcards Kosakata Cerdas &amp; Audio Asli
				</h2>
				<p class="font-body-md text-body-md text-on-surface-variant">
					Ingat kosakata 4x lebih cepat dengan algoritma pengulangan terjadwal saat memori otak Anda mulai memudar.
				</p>
			</div>

			<!-- Filter Pill Chips -->
			<div class="flex flex-wrap items-center gap-2">
				<button
					type="button"
					onclick={() => (activeCategory = 'Kata Keterangan')}
					class="rounded-full px-4 py-2 font-medium text-label-sm transition-colors {activeCategory === 'Kata Keterangan'
						? 'bg-primary-container !text-white text-white'
						: 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'}"
				>
					Kata Keterangan
				</button>
				<button
					type="button"
					onclick={() => (activeCategory = 'Kata Benda')}
					class="rounded-full px-4 py-2 font-medium text-label-sm transition-colors {activeCategory === 'Kata Benda'
						? 'bg-primary-container !text-white text-white'
						: 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'}"
				>
					Kata Benda
				</button>
				<button
					type="button"
					onclick={() => (activeCategory = 'Kata Kerja')}
					class="rounded-full px-4 py-2 font-medium text-label-sm transition-colors {activeCategory === 'Kata Kerja'
						? 'bg-primary-container !text-white text-white'
						: 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'}"
				>
					Kata Kerja
				</button>
			</div>
		</div>

		<!-- Grid of Flashcard Items -->
		<div class="grid grid-cols-1 gap-space-lg md:grid-cols-2 lg:grid-cols-3">
			<!-- Card 1 -->
			<div class="rounded-3xl bg-surface-container-lowest p-5 shadow-sm transition-all duration-200 hover:shadow-md" use:viewportReveal={{ direction: 'up', delay: 100 }}>
				<div class="mb-3 flex items-start justify-between">
					<div class="flex items-baseline gap-3">
						<span class="flex size-6 items-center justify-center rounded-full bg-surface-container font-bold text-label-sm text-outline">1</span>
						<div>
							<h3 class="font-japanese-kanji-lg text-japanese-kanji-lg font-bold leading-none text-on-surface">これ</h3>
							<div class="mt-1 flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant">
								<span class="font-semibold text-outline">kore</span> •
								<span class="font-semibold text-on-surface">ini</span>
							</div>
						</div>
					</div>
					<div class="flex items-center gap-2">
						<span class="rounded-full bg-tertiary-fixed px-2.5 py-0.5 font-semibold text-label-sm text-on-tertiary-fixed">Kata Keterangan</span>
						<button
							aria-label="Audio Play"
							onclick={playDemoAudio}
							class="flex size-9 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant shadow-sm transition-colors hover:bg-primary-container hover:!text-white hover:text-white {isAudioPlaying ? 'ring-2 ring-primary-container' : ''}"
							type="button"
						>
							<Volume2 class="size-[18px]" />
						</button>
					</div>
				</div>
				<div class="mb-3 rounded-2xl bg-surface-container-low p-3.5">
					<div class="mb-0.5 font-japanese-kana-md text-body-lg font-medium text-on-surface">これは本です。</div>
					<div class="font-body-sm text-body-sm text-on-surface-variant">Ini adalah buku.</div>
				</div>
				<div class="flex items-center justify-between pt-1 text-label-sm text-outline">
					<span class="flex items-center gap-1">
						<CircleCheck class="size-3.5 text-tertiary" /> Menguasai: Level 4
					</span>
					<span class="font-semibold text-primary-container">Review: 5 Hari lagi</span>
				</div>
			</div>

			<!-- Card 2 -->
			<div class="rounded-3xl bg-surface-container-lowest p-5 shadow-sm transition-all duration-200 hover:shadow-md" use:viewportReveal={{ direction: 'up', delay: 200 }}>
				<div class="mb-3 flex items-start justify-between">
					<div class="flex items-baseline gap-3">
						<span class="flex size-6 items-center justify-center rounded-full bg-surface-container font-bold text-label-sm text-outline">2</span>
						<div>
							<h3 class="font-japanese-kanji-lg text-japanese-kanji-lg font-bold leading-none text-on-surface">それ</h3>
							<div class="mt-1 flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant">
								<span class="font-semibold text-outline">sore</span> •
								<span class="font-semibold text-on-surface">itu (dekat lawan bicara)</span>
							</div>
						</div>
					</div>
					<div class="flex items-center gap-2">
						<span class="rounded-full bg-tertiary-fixed px-2.5 py-0.5 font-semibold text-label-sm text-on-tertiary-fixed">Kata Keterangan</span>
						<button
							aria-label="Audio Play"
							onclick={playDemoAudio}
							class="flex size-9 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant shadow-sm transition-colors hover:bg-primary-container hover:!text-white hover:text-white {isAudioPlaying ? 'ring-2 ring-primary-container' : ''}"
							type="button"
						>
							<Volume2 class="size-[18px]" />
						</button>
					</div>
				</div>
				<div class="mb-3 rounded-2xl bg-surface-container-low p-3.5">
					<div class="mb-0.5 font-japanese-kana-md text-body-lg font-medium text-on-surface">それは今日の新聞です。</div>
					<div class="font-body-sm text-body-sm text-on-surface-variant">Itu adalah koran hari ini.</div>
				</div>
				<div class="flex items-center justify-between pt-1 text-label-sm text-outline">
					<span class="flex items-center gap-1">
						<CircleCheck class="size-3.5 text-tertiary" /> Menguasai: Level 3
					</span>
					<span class="font-semibold text-primary-container">Review: 2 Hari lagi</span>
				</div>
			</div>

			<!-- Card 3 -->
			<div class="rounded-3xl bg-surface-container-lowest p-5 shadow-sm transition-all duration-200 hover:shadow-md" use:viewportReveal={{ direction: 'up', delay: 300 }}>
				<div class="mb-3 flex items-start justify-between">
					<div class="flex items-baseline gap-3">
						<span class="flex size-6 items-center justify-center rounded-full bg-surface-container font-bold text-label-sm text-outline">3</span>
						<div>
							<h3 class="font-japanese-kanji-lg text-japanese-kanji-lg font-bold leading-none text-on-surface">あれ</h3>
							<div class="mt-1 flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant">
								<span class="font-semibold text-outline">are</span> •
								<span class="font-semibold text-on-surface">itu (jauh dari keduanya)</span>
							</div>
						</div>
					</div>
					<div class="flex items-center gap-2">
						<span class="rounded-full bg-tertiary-fixed px-2.5 py-0.5 font-semibold text-label-sm text-on-tertiary-fixed">Kata Keterangan</span>
						<button
							aria-label="Audio Play"
							onclick={playDemoAudio}
							class="flex size-9 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant shadow-sm transition-colors hover:bg-primary-container hover:!text-white hover:text-white {isAudioPlaying ? 'ring-2 ring-primary-container' : ''}"
							type="button"
						>
							<Volume2 class="size-[18px]" />
						</button>
					</div>
				</div>
				<div class="mb-3 rounded-2xl bg-surface-container-low p-3.5">
					<div class="mb-0.5 font-japanese-kana-md text-body-lg font-medium text-on-surface">あれは富士山です。</div>
					<div class="font-body-sm text-body-sm text-on-surface-variant">Itu yang di kejauhan adalah Gunung Fuji.</div>
				</div>
				<div class="flex items-center justify-between pt-1 text-label-sm text-outline">
					<span class="flex items-center gap-1">
						<CircleCheck class="size-3.5 text-tertiary" /> Menguasai: Baru
					</span>
					<span class="font-semibold text-primary-container">Review: Hari ini</span>
				</div>
			</div>
		</div>

		<!-- Spaced Repetition Explanatory Callout -->
		<div class="mt-space-lg flex flex-col items-center justify-between gap-4 rounded-2xl bg-surface-container-low p-5 md:flex-row" use:viewportReveal={{ direction: 'up', delay: 150 }}>
			<div class="flex items-center gap-3">
				<div class="flex size-10 items-center justify-center rounded-full bg-primary-fixed text-on-primary-fixed">
					<RefreshCw class="size-5" />
				</div>
				<div>
					<h4 class="font-label-lg text-label-lg font-bold text-on-surface">Bagaimana SRS Membantu Kamu?</h4>
					<p class="font-body-sm text-body-sm text-on-surface-variant">
						Sistem menghitung kurva lupa (forgetting curve) Ebbinghaus secara otomatis sehingga Anda hanya mereview kosakata yang hampir terlupakan.
					</p>
				</div>
			</div>
		</div>
	</div>
</section>
