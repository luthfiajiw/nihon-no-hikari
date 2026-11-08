<script lang="ts">
	import { Bot, ChevronRight, Clock, GraduationCap, Layers } from 'lucide-svelte';
	import { viewportReveal } from '$lib/actions/viewport-reveal';

	let {
		scrollTo
	}: {
		scrollTo: (id: string, e?: MouseEvent) => void;
	} = $props();
</script>

<!-- FEATURE 1: KURIKULUM & MODUL TERSTRUKTUR -->
<section class="w-full scroll-mt-24 bg-surface-container-low py-space-xl" id="kursus">
	<div class="mx-auto max-w-7xl px-gutter">
		<!-- Section Heading -->
		<div class="mb-space-xl max-w-2xl" use:viewportReveal={{ direction: 'up' }}>
			<div class="mb-space-sm inline-flex items-center gap-1.5 rounded-full bg-surface-container-highest px-3 py-1 font-semibold text-label-sm text-on-surface">
				<GraduationCap class="size-4 text-primary-container" />
				Kurikulum Terpadu
			</div>
			<h2 class="mb-2 font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">
				Kursus dengan Modul &amp; Pelajaran Terstruktur
			</h2>
			<p class="font-body-md text-body-md leading-relaxed text-on-surface-variant">
				Dirancang bertahap mengikuti standar The Japan Foundation, memandu Anda dari nol mutlak hingga kemampuan bahasa tingkat lanjut dengan peta belajar yang jelas.
			</p>
		</div>

		<!-- Bento Grid Courses -->
		<div class="grid grid-cols-1 items-start gap-space-lg lg:grid-cols-12">
			<!-- Left: Course Level Cards -->
			<div class="flex flex-col gap-space-md lg:col-span-5">
				<!-- Level N5 -->
				<div class="rounded-2xl bg-surface-container-lowest p-5 shadow-sm transition-all duration-200" use:viewportReveal={{ direction: 'up', delay: 100 }}>
					<div class="mb-3 flex items-center justify-between">
						<span class="rounded-full bg-on-surface px-2.5 py-0.5 font-bold text-label-sm text-surface">N5</span>
						<span class="rounded-full bg-surface-container px-2.5 py-0.5 font-semibold text-label-sm text-on-surface-variant">Pemula Dasar</span>
					</div>
					<h3 class="mb-1 font-headline-sm text-headline-sm font-bold text-on-surface">Belajar JLPT N5 Lengkap</h3>
					<p class="mb-4 font-body-sm text-body-sm text-on-surface-variant">
						Materi persiapan JLPT N5 komplit: Hiragana, Katakana, kanji dasar (100+), kosakata (800+), dan tata bahasa dasar.
					</p>
					<div class="flex items-center justify-between pt-3 font-label-sm text-label-sm text-on-surface-variant">
						<div class="flex items-center gap-4">
							<span class="flex items-center gap-1">
								<Clock class="size-4" /> 72 Jam
							</span>
							<span class="flex items-center gap-1">
								<Layers class="size-4" /> 11 Materi
							</span>
						</div>
						<button
							type="button"
							onclick={(e) => scrollTo('harga', e)}
							class="rounded-xl bg-primary-container px-3.5 py-1.5 text-center font-semibold !text-white text-white transition-colors hover:bg-landing-primary"
						>
							Lihat Detail
						</button>
					</div>
				</div>

				<!-- Level N4 -->
				<div class="rounded-2xl bg-surface-container-lowest p-5 shadow-sm transition-all hover:shadow-md" use:viewportReveal={{ direction: 'up', delay: 180 }}>
					<div class="mb-2 flex items-center justify-between">
						<span class="rounded-full bg-surface-container-highest px-2.5 py-0.5 font-bold font-label-sm text-label-sm text-on-surface">N4</span>
						<span class="rounded-full bg-surface-container px-2.5 py-0.5 font-semibold text-label-sm text-on-surface-variant">Pemula Lanjutan</span>
					</div>
					<h3 class="mb-1 font-headline-sm text-headline-sm font-bold text-on-surface">Pemantapan JLPT N4</h3>
					<p class="mb-3 font-body-sm text-body-sm text-on-surface-variant">
						300 Kanji, 1.500 Kosakata, pola kalimat majemuk, percakapan sehari-hari.
					</p>
					<div class="flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
						<span class="flex items-center gap-1">
							<Clock class="size-4" /> 90 Jam • 14 Materi
						</span>
						<button
							type="button"
							onclick={(e) => scrollTo('harga', e)}
							class="flex items-center gap-0.5 font-semibold text-primary-container hover:underline"
						>
							Buka Modul <ChevronRight class="size-3.5" />
						</button>
					</div>
				</div>

				<!-- Level N3 & N2 Grid -->
				<div class="grid grid-cols-2 gap-space-md">
					<div class="rounded-2xl bg-surface-container-lowest p-4 shadow-sm transition-all hover:shadow-md" use:viewportReveal={{ direction: 'up', delay: 240 }}>
						<span class="rounded-md bg-surface-container-highest px-2 py-0.5 font-bold font-label-sm text-label-sm text-on-surface">N3</span>
						<h4 class="mt-2 mb-1 font-headline-sm text-body-lg font-bold text-on-surface">Menengah Mandiri</h4>
						<p class="font-body-sm text-[12px] text-on-surface-variant">Artikel berita &amp; ekspresi natural.</p>
					</div>
					<div class="rounded-2xl bg-surface-container-lowest p-4 shadow-sm transition-all hover:shadow-md" use:viewportReveal={{ direction: 'up', delay: 300 }}>
						<span class="rounded-md bg-surface-container-highest px-2 py-0.5 font-bold font-label-sm text-label-sm text-on-surface">N2 - N1</span>
						<h4 class="mt-2 mb-1 font-headline-sm text-body-lg font-bold text-on-surface">Bisnis &amp; Mahir</h4>
						<p class="font-body-sm text-[12px] text-on-surface-variant">Keperluan kerja &amp; universitas Jepang.</p>
					</div>
				</div>
			</div>

			<!-- Right: Interactive Module Reader Preview -->
			<div class="rounded-3xl bg-surface-container-lowest p-6 shadow-md lg:col-span-7" id="modul-preview" use:viewportReveal={{ direction: 'right', delay: 200 }}>
				<div class="mb-4 flex items-center justify-between pb-4">
					<div class="flex items-center gap-2">
						<span class="size-3 rounded-full bg-secondary-fixed"></span>
						<span class="font-headline-sm text-headline-sm font-bold text-on-surface">Apa itu Hiragana?</span>
					</div>
					<button
						type="button"
						onclick={(e) => scrollTo('ai-scheduler', e)}
						class="flex items-center gap-1 rounded-full bg-surface-container px-3 py-1 font-semibold text-label-sm text-on-surface transition-colors hover:bg-surface-container-high"
					>
						<Bot class="size-3.5" /> Tanya AI Sensei
					</button>
				</div>

				<div class="grid grid-cols-1 gap-4 md:grid-cols-12">
					<!-- Syllabus list -->
					<div class="flex flex-col gap-1.5 rounded-2xl bg-surface-container-low p-3 font-label-sm text-label-sm md:col-span-4">
						<div class="flex items-center justify-between px-2 py-1 text-xs font-bold tracking-wider text-outline uppercase">
							<span>Modul Hiragana (1/11)</span>
						</div>
						<div class="flex items-center gap-2 rounded-xl bg-surface-container-lowest p-2 font-semibold text-on-surface shadow-sm">
							<span class="flex size-4 items-center justify-center rounded-full bg-primary-container text-[10px] text-white">1</span>
							<span class="truncate">Apa Itu Hiragana?</span>
						</div>
						<div class="flex items-center gap-2 rounded-xl p-2 text-on-surface-variant transition-colors hover:bg-surface-container">
							<span class="flex size-4 items-center justify-center rounded-full bg-surface-container-highest text-[10px] text-outline">2</span>
							<span class="truncate">Baris A (あ い う え お)</span>
						</div>
						<div class="flex items-center gap-2 rounded-xl p-2 text-on-surface-variant transition-colors hover:bg-surface-container">
							<span class="flex size-4 items-center justify-center rounded-full bg-surface-container-highest text-[10px] text-outline">3</span>
							<span class="truncate">Baris Ka (か き く け こ)</span>
						</div>
						<div class="flex items-center gap-2 rounded-xl p-2 text-on-surface-variant transition-colors hover:bg-surface-container">
							<span class="flex size-4 items-center justify-center rounded-full bg-surface-container-highest text-[10px] text-outline">4</span>
							<span class="truncate">Baris Sa (さ し す せ そ)</span>
						</div>
						<div class="flex items-center gap-2 rounded-xl p-2 text-on-surface-variant transition-colors hover:bg-surface-container">
							<span class="flex size-4 items-center justify-center rounded-full bg-surface-container-highest text-[10px] text-outline">5</span>
							<span class="truncate">Aturan Dakuon &amp; Handakuon</span>
						</div>
					</div>

					<!-- Lesson Content Reader -->
					<div class="flex flex-col gap-3 md:col-span-8">
						<div class="rounded-2xl bg-surface-container-low p-4">
							<span class="mb-2 inline-block rounded-full bg-surface-container-highest px-2.5 py-0.5 font-semibold text-label-sm text-on-surface">Sistem Penulisan Jepang</span>
							<h4 class="mb-2 font-headline-md text-headline-md font-bold text-on-surface">
								Pengenalan Hiragana <span class="font-japanese-kana-md text-japanese-kana-md font-normal text-primary-container">(ひらがな)</span>
							</h4>
							<p class="font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
								Hiragana adalah salah satu dari tiga sistem aksara utama dalam bahasa Jepang. Memiliki bentuk yang luwes dan fleksibel, Hiragana menjadi fondasi penting bagi siapa saja yang baru memulai belajar bahasa Jepang.
							</p>
						</div>
						<div class="space-y-2.5">
							<div class="rounded-2xl bg-surface-container-low p-3.5 transition-colors hover:bg-surface-container">
								<div class="mb-1 font-label-lg text-label-lg font-bold text-on-surface">1. Sistem Aksara Silabis</div>
								<p class="font-body-sm text-body-sm text-on-surface-variant">
									Setiap karakter Hiragana mewakili satu suku kata utuh (misalnya か = <em>ka</em>, み = <em>mi</em>), bukan huruf mati atau vokal terpisah seperti dalam alfabet Latin.
								</p>
							</div>
							<div class="rounded-2xl bg-surface-container-low p-3.5 transition-colors hover:bg-surface-container">
								<div class="mb-1 font-label-lg text-label-lg font-bold text-on-surface">2. Konsistensi Pengucapan (Fonetik)</div>
								<p class="font-body-sm text-body-sm text-on-surface-variant">
									Bunyi setiap karakter Hiragana selalu konsisten dan tidak berubah terlepas dari posisi kata maupun gabungannya dalam kalimat.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
