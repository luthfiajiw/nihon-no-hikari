<script lang="ts">
	import { ArrowRight, BadgeCheck, BookOpen, TrendingUp, Volume2 } from 'lucide-svelte';
	import { resolve } from '$app/paths';
	import { viewportReveal } from '$lib/actions/viewport-reveal';

	let {
		scrollTo,
		isAudioPlaying,
		playDemoAudio
	}: {
		scrollTo: (id: string, e?: MouseEvent) => void;
		isAudioPlaying: boolean;
		playDemoAudio: () => void;
	} = $props();
</script>

<!-- HERO SECTION -->
<section class="relative w-full scroll-mt-24 overflow-hidden py-space-xl lg:py-24" id="beranda">
	<div class="relative z-10 mx-auto max-w-7xl px-gutter">
		<!-- Top Trust Badges -->
		<div class="mb-space-lg flex flex-wrap items-center gap-space-sm" use:viewportReveal={{ direction: 'up', delay: 100 }}>
			<span class="inline-flex items-center gap-1.5 rounded-full bg-primary-fixed px-3.5 py-1 font-label-sm text-label-sm text-on-primary-fixed">
				<BadgeCheck class="size-4" />
				Persiapan JLPT N5 - N1 Lengkap
			</span>
			<span class="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3.5 py-1 font-label-sm text-label-sm text-on-surface-variant">
				<Volume2 class="size-4" />
				Native Accent Audio
			</span>
		</div>

		<!-- Main Grid Hero -->
		<div class="grid grid-cols-1 items-start gap-space-xl lg:grid-cols-12">
			<!-- Left Column: Copy & CTAs -->
			<div class="flex flex-col justify-center lg:col-span-6" use:viewportReveal={{ direction: 'left', delay: 150 }}>
				<h1 class="mb-space-md font-display text-display leading-[1.12] tracking-tight text-on-surface">
					Kuasai Bahasa Jepang <br />
					<span class="relative text-primary-container">
						Lebih Cepat
						<svg class="absolute -bottom-2 left-0 h-3 w-full text-secondary-fixed opacity-70" preserveAspectRatio="none" viewBox="0 0 100 20">
							<path d="M0,15 Q50,0 100,15" fill="transparent" stroke="currentColor" stroke-linecap="round" stroke-width="6"></path>
						</svg>
					</span> &amp; Terstruktur.
				</h1>
				<p class="mb-space-xl max-w-xl font-body-lg text-body-lg leading-relaxed text-on-surface-variant">
					Platform komprehensif dari N5 hingga N1. Dilengkapi modul interaktif, audio penutur asli Tokyo, flashcards pintar berspasi (SRS), simulasi ujian JLPT resmi, dan jadwal belajar cerdas adaptif berbasis AI.
				</p>
				<div class="mb-space-xl flex flex-col items-stretch gap-space-md sm:flex-row sm:items-center">
					<a
						class="landing-btn-primary inline-flex items-center justify-center gap-2 rounded-full bg-primary-container px-7 py-3.5 text-center font-label-lg text-label-lg font-bold !text-white text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-landing-primary hover:shadow-lg"
						href={resolve('/register')}
					>
						<span class="!text-white text-white">Trial Belajar Gratis 7 Hari</span>
						<ArrowRight class="size-[18px]" />
					</a>
					<button
						type="button"
						onclick={(e) => scrollTo('kursus', e)}
						class="inline-flex items-center justify-center gap-2 rounded-full bg-surface-container-lowest px-6 py-3.5 text-center font-label-lg text-label-lg text-on-surface shadow-sm transition-all duration-200 hover:bg-surface-container"
					>
						<BookOpen class="size-[18px]" />
						<span>Lihat Contoh Modul</span>
					</button>
				</div>

				<!-- Micro Stats Row -->
				<div class="grid grid-cols-3 gap-space-sm rounded-2xl bg-surface-container-low/60 p-space-md pt-space-md">
					<div>
						<div class="font-headline-sm text-headline-sm font-bold text-on-surface">2.400+</div>
						<div class="font-label-sm text-label-sm text-on-surface-variant">Kosakata &amp; Kanji</div>
					</div>
					<div>
						<div class="font-headline-sm text-headline-sm font-bold text-on-surface">98.4%</div>
						<div class="font-label-sm text-label-sm text-on-surface-variant">Kelulusan JLPT</div>
					</div>
					<div>
						<div class="font-headline-sm text-headline-sm font-bold text-on-surface">24/7</div>
						<div class="font-label-sm text-label-sm text-on-surface-variant">Tutor AI Standby</div>
					</div>
				</div>
			</div>

			<!-- Right Column: Interactive Mockup Shell -->
			<div class="flex flex-col gap-space-md lg:col-span-6" use:viewportReveal={{ direction: 'right', delay: 200 }}>
				<div class="relative rounded-3xl bg-surface-container-lowest p-3 shadow-md">
					<!-- Pagoda Scenic Banner -->
					<div class="relative flex h-44 w-full flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-r from-surface-container-highest to-surface-container p-5 sm:h-52">
						<div
							class="absolute inset-0 bg-cover bg-center opacity-90"
							style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCgLBihWm9knmrrpu3KxtnXskCPiDJGMvbvj9g5JAk5arfgEixLePwwgEae6Ak1u56daIpKD1_fAbd39PWAUkl8Fx8TLTxP4Aw-z7P4VR9Y4AIl5Otiidlh1Af8N6edu2IKxvKKj4NwZEsYpl4EFSIQXmi82jb4iE7mfDfXk9d7BhrPRLbdFFfW0LMyyXzbzUv_9QUvHqEUwOaIjgUYM2lC4mWQCwIat_2ZUsLOJwjU')"
						></div>
						<div class="absolute inset-0 bg-gradient-to-r from-on-surface/60 via-on-surface/20 to-transparent"></div>

						<!-- Floating Header Elements -->
						<div class="relative z-10 flex items-center justify-between">
							<span class="rounded-full bg-on-surface px-3 py-0.5 font-bold text-label-sm text-surface">Kursus</span>
							<span class="inline-flex items-center gap-1 rounded-full bg-surface-container-lowest/90 px-3 py-1 text-label-sm text-on-surface shadow-sm backdrop-blur-sm">
								<span class="size-2 animate-ping rounded-full bg-secondary-fixed"></span>
								Live SRS Active
							</span>
						</div>
						<div class="relative z-10 text-white">
							<h3 class="mb-1 font-headline-md text-headline-md font-bold text-white drop-shadow-sm">Pilih Level &amp; Mulai Perjalananmu</h3>
							<p class="max-w-sm font-body-sm text-body-sm text-white/90 line-clamp-1">Materi terstruktur dari dasar huruf Kana hingga pemahaman bacaan JLPT N1.</p>
						</div>
					</div>

					<!-- Inner Split Cards -->
					<div class="mt-space-md grid grid-cols-1 gap-space-md p-space-xs sm:grid-cols-2">
						<!-- Progress Tracker -->
						<div class="flex flex-col justify-between rounded-2xl bg-surface-container-low p-4">
							<div>
								<div class="mb-2 flex items-center justify-between">
									<span class="flex items-center gap-1.5 font-label-md text-label-md font-semibold text-on-surface">
										<TrendingUp class="size-[18px] text-landing-primary" />
										Progress Belajarmu
									</span>
									<span class="font-bold text-label-sm text-primary-container">33%</span>
								</div>
								<div class="mb-2 font-body-sm text-body-sm text-on-surface-variant">
									Kursus saat ini: <strong class="text-on-surface">JLPT N5</strong>
								</div>
								<!-- Progress Bar -->
								<div class="mb-3 h-2.5 w-full overflow-hidden rounded-full bg-outline-variant/40">
									<div class="h-2.5 rounded-full bg-primary-container transition-all duration-700" style="width: 33%"></div>
								</div>
							</div>
							<button
								type="button"
								onclick={(e) => scrollTo('kursus', e)}
								class="inline-flex w-full items-center justify-between rounded-xl bg-primary-container px-3 py-2 font-semibold text-label-sm !text-white text-white transition-colors hover:bg-landing-primary"
							>
								<span>Lanjut Belajar</span>
								<ArrowRight class="size-4" />
							</button>
						</div>

						<!-- Quick Audio Vocabulary Card -->
						<div class="flex flex-col justify-between rounded-2xl bg-surface-container-low p-4">
							<div>
								<div class="mb-1.5 flex items-center justify-between">
									<span class="rounded-md bg-secondary-fixed px-2 py-0.5 font-label-sm text-label-sm font-semibold text-on-secondary-fixed">N5 Dasar</span>
									<button
										aria-label="Audio Play"
										class="flex size-8 items-center justify-center rounded-full bg-surface-container-highest text-primary-container shadow-sm transition-colors hover:bg-primary-container hover:text-white {isAudioPlaying ? 'ring-2 ring-primary-container' : ''}"
										type="button"
										onclick={playDemoAudio}
									>
										<Volume2 class="size-[18px]" />
									</button>
								</div>
								<div class="flex items-baseline gap-2">
									<span class="font-japanese-kanji-lg text-japanese-kanji-lg font-bold text-on-surface">これ</span>
									<span class="font-medium text-body-sm text-on-surface-variant">(kore - ini)</span>
								</div>
							</div>
							<div class="mt-2 rounded-xl bg-surface-container-lowest p-2 font-body-sm text-body-sm text-on-surface-variant">
								<span class="font-medium text-on-surface">これは本です。</span>
								<div class="text-[11px] text-outline">Ini adalah buku.</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
