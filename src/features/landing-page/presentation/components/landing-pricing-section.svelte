<script lang="ts">
	import { BadgeCheck, CircleCheck, Tag } from 'lucide-svelte';
	import { viewportReveal } from '$lib/actions/viewport-reveal';
	import type { CourseLevelItem } from '$features/course/domain/entities/course.entity';

	let { levels = [] }: { levels?: CourseLevelItem[] } = $props();

	const defaultPoints: Record<string, string[]> = {
		N5: [
			'Modul Hiragana & Katakana lengkap',
			'800+ Flashcards audio penutur asli',
			'15 Bab tata bahasa dasar & 100 Kanji',
			'3x Simulasi Ujian JLPT N5',
			'AI Sensei Tutor 24/7'
		],
		N4: [
			'14 Materi percakapan kontekstual',
			'Bank pola tata bahasa (Bunpo) N4',
			'1.500 Kosakata & 300 Kanji SRS',
			'5x Simulasi Ujian JLPT N4',
			'Penjadwalan belajar AI adaptif'
		],
		N3: [
			'650 Kanji & 3.750 Kosakata lengkap',
			'Dokkai & Choukai intensif standar ujian',
			'Analisis kelemahan AI otomatis',
			'8x Simulasi Tryout N3 dengan timer',
			'Diskusi komunitas & bimbingan Sensei'
		],
		N2: [
			'Artikel berita & ekspresi bisnis formal',
			'Pelatihan Choukai tempo asli Jepang',
			'1.000 Kanji & 6.000 Kosakata bisnis',
			'10x Tryout N2 resmi dengan pembahasan',
			'Feedback AI Essay & Dokkai mendalam'
		],
		N1: [
			'Nuansa bahasa idiomatis tingkat tinggi',
			'Materi debat, opini & editorial koran',
			'2.000 Kanji & 10.000 Kosakata komplit',
			'Tryout N1 tanpa batas & simulasi nyata',
			'Simulasi wawancara kerja & beasiswa AI'
		]
	};

	const defaultDescriptions: Record<string, string> = {
		N5: 'Pemula Dasar (0 → N5)',
		N4: 'Percakapan & Kalimat Majemuk',
		N3: 'Menengah Mandiri (Best Value)',
		N2: 'Akademik & Karir Jepang',
		N1: 'Penutur Mahir & Profesional'
	};

	function getLevelData(code: string) {
		const level = levels.find((l) => l.code.toUpperCase() === code.toUpperCase());
		const price = level?.price ?? 0;
		const amount = price === 0 ? 'Gratis' : 'Rp ' + new Intl.NumberFormat('id-ID').format(price);
		const subtitle = price === 0 ? 'Akses gratis selamanya' : 'Sekali bayar • Akses selamanya';
		const rawPoints = level?.points ?? [];
		const points = rawPoints.length > 0 ? rawPoints : (defaultPoints[code] ?? []);
		const description = level?.description || defaultDescriptions[code] || `Level ${code}`;
		return { code, price, amount, subtitle, points, description };
	}

	const n5 = $derived(getLevelData('N5'));
	const n4 = $derived(getLevelData('N4'));
	const n3 = $derived(getLevelData('N3'));
	const n2 = $derived(getLevelData('N2'));
	const n1 = $derived(getLevelData('N1'));
</script>

<!-- SECTION 5: PILIHAN PAKET & HARGA -->
<section class="w-full scroll-mt-24 bg-surface-container-low py-space-xl" id="harga">
	<div class="mx-auto max-w-7xl px-gutter">
		<div class="mx-auto mb-space-xl max-w-3xl text-center" use:viewportReveal={{ direction: 'up' }}>
			<div
				class="mb-space-sm inline-flex items-center gap-1.5 rounded-full bg-primary-fixed px-3.5 py-1 text-label-sm font-semibold text-on-primary-fixed"
			>
				<Tag class="size-4" /> Pilihan Paket &amp; Investasi Belajar
			</div>
			<h2 class="mb-2 font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">
				Pilih Paket Belajar Sesuai Target JLPT Anda
			</h2>
			<p class="mx-auto max-w-2xl font-body-md text-body-md text-on-surface-variant">
				Akses modul terstruktur, ribuan flashcard kosakata SRS, latihan soal simulasi resmi, dan AI
				Sensei personal tutor. Pilih satuan level atau paket hemat bertahap.
			</p>
			<div
				class="mt-4 inline-flex items-center gap-2 rounded-full bg-surface-container-highest px-4 py-1.5 text-label-sm font-semibold text-on-surface"
			>
				<BadgeCheck class="size-4 text-primary-container" />
				Akses Sekali Bayar (Lifetime Access) • Garansi Update Materi
			</div>
		</div>

		<div class="mb-space-lg grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 lg:grid-cols-5">
			<!-- N5 -->
			<div
				class="flex flex-col justify-between rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-sm transition-all hover:shadow-md"
				use:viewportReveal={{ direction: 'up', delay: 80 }}
			>
				<div class="flex flex-col">
					<div class="mb-2 flex items-center justify-between">
						<span
							class="rounded-full bg-surface-container-highest px-2.5 py-0.5 font-label-sm text-label-sm font-bold text-on-surface"
						>
							N5
						</span>
						<span
							class="rounded-full bg-secondary-fixed px-2 py-0.5 font-label-sm text-[10px] font-bold text-on-secondary-fixed"
						>
							Favorit Pemula
						</span>
					</div>
					<h3 class="mb-0.5 font-headline-sm text-[18px] font-bold text-on-surface">JLPT N5</h3>
					<p class="mb-3 font-body-sm text-[12px] text-on-surface-variant">{n5.description}</p>
					<div class="mb-4">
						<div class="text-[22px] leading-none font-bold text-on-surface">{n5.amount}</div>
						<div class="mt-0.5 text-[11px] text-outline">{n5.subtitle}</div>
					</div>
					<div
						class="mb-6 space-y-2 border-t border-outline-variant/30 pt-3 font-body-sm text-[12px] text-on-surface-variant"
					>
						{#each n5.points as point}
							<div class="flex items-start gap-1.5">
								<CircleCheck class="mt-0.5 size-4 shrink-0 text-primary-container" />
								<span>{point}</span>
							</div>
						{/each}
					</div>
				</div>
				<a
					class="block w-full rounded-full bg-surface-container py-2.5 text-center font-label-md text-label-md font-bold text-on-surface transition-colors hover:bg-surface-container-high"
					href="/pricing/n5"
				>
					Lihat Detail N5
				</a>
			</div>

			<!-- N4 -->
			<div
				class="flex flex-col justify-between rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-sm transition-all hover:shadow-md"
				use:viewportReveal={{ direction: 'up', delay: 160 }}
			>
				<div class="flex flex-col">
					<div class="mb-2 flex items-center justify-between">
						<span
							class="rounded-full bg-surface-container-highest px-2.5 py-0.5 font-label-sm text-label-sm font-bold text-on-surface"
						>
							N4
						</span>
						<span class="text-[11px] font-medium text-outline">Pemula Lanjut</span>
					</div>
					<h3 class="mb-0.5 font-headline-sm text-[18px] font-bold text-on-surface">JLPT N4</h3>
					<p class="mb-3 font-body-sm text-[12px] text-on-surface-variant">
						{n4.description}
					</p>
					<div class="mb-4">
						<div class="text-[22px] leading-none font-bold text-on-surface">{n4.amount}</div>
						<div class="mt-0.5 text-[11px] text-outline">{n4.subtitle}</div>
					</div>
					<div
						class="mb-6 space-y-2 border-t border-outline-variant/30 pt-3 font-body-sm text-[12px] text-on-surface-variant"
					>
						{#each n4.points as point}
							<div class="flex items-start gap-1.5">
								<CircleCheck class="mt-0.5 size-4 shrink-0 text-primary-container" />
								<span>{point}</span>
							</div>
						{/each}
					</div>
				</div>
				<a
					class="block w-full rounded-full bg-surface-container py-2.5 text-center font-label-md text-label-md font-bold text-on-surface transition-colors hover:bg-surface-container-high"
					href="/pricing/n4"
				>
					Lihat Detail N4
				</a>
			</div>

			<!-- N3 (Populer) -->
			<div
				class="relative flex flex-col justify-between rounded-3xl border-2 border-primary-container bg-surface-container-lowest p-5 shadow-md transition-all hover:shadow-lg"
				use:viewportReveal={{ direction: 'up', delay: 240 }}
			>
				<div class="flex flex-col">
					<div class="mb-2 flex items-center justify-between">
						<span
							class="rounded-full bg-primary-container px-2.5 py-0.5 font-label-sm text-label-sm font-bold !text-white text-white"
						>
							N3
						</span>
						<span
							class="rounded-full bg-primary-fixed px-2 py-0.5 font-label-sm text-[10px] font-bold text-on-primary-fixed"
						>
							Paling Populer
						</span>
					</div>
					<h3 class="mb-0.5 font-headline-sm text-[18px] font-bold text-on-surface">JLPT N3</h3>
					<p class="mb-3 font-body-sm text-[12px] text-on-surface-variant">
						{n3.description}
					</p>
					<div class="mb-4">
						<div class="text-[22px] leading-none font-bold text-primary-container">
							{n3.amount}
						</div>
						<div class="mt-0.5 text-[11px] text-outline">{n3.subtitle}</div>
					</div>
					<div
						class="mb-6 space-y-2 border-t border-outline-variant/30 pt-3 font-body-sm text-[12px] text-on-surface-variant"
					>
						{#each n3.points as point}
							<div class="flex items-start gap-1.5">
								<CircleCheck class="mt-0.5 size-4 shrink-0 text-primary-container" />
								<span>{point}</span>
							</div>
						{/each}
					</div>
				</div>
				<a
					class="landing-btn-primary block w-full rounded-full bg-primary-container py-2.5 text-center font-label-md text-label-md font-bold !text-white text-white shadow-sm transition-colors hover:bg-landing-primary"
					href="/pricing/n3"
				>
					<span class="!text-white text-white">Lihat Detail N3</span>
				</a>
			</div>

			<!-- N2 -->
			<div
				class="flex flex-col justify-between rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-sm transition-all hover:shadow-md"
				use:viewportReveal={{ direction: 'up', delay: 320 }}
			>
				<div class="flex flex-col">
					<div class="mb-2 flex items-center justify-between">
						<span
							class="rounded-full bg-surface-container-highest px-2.5 py-0.5 font-label-sm text-label-sm font-bold text-on-surface"
						>
							N2
						</span>
						<span class="text-[11px] font-medium text-outline">Bisnis &amp; Kerja</span>
					</div>
					<h3 class="mb-0.5 font-headline-sm text-[18px] font-bold text-on-surface">JLPT N2</h3>
					<p class="mb-3 font-body-sm text-[12px] text-on-surface-variant">
						{n2.description}
					</p>
					<div class="mb-4">
						<div class="text-[22px] leading-none font-bold text-on-surface">{n2.amount}</div>
						<div class="mt-0.5 text-[11px] text-outline">{n2.subtitle}</div>
					</div>
					<div
						class="mb-6 space-y-2 border-t border-outline-variant/30 pt-3 font-body-sm text-[12px] text-on-surface-variant"
					>
						{#each n2.points as point}
							<div class="flex items-start gap-1.5">
								<CircleCheck class="mt-0.5 size-4 shrink-0 text-primary-container" />
								<span>{point}</span>
							</div>
						{/each}
					</div>
				</div>
				<a
					class="block w-full rounded-full bg-surface-container py-2.5 text-center font-label-md text-label-md font-bold text-on-surface transition-colors hover:bg-surface-container-high"
					href="/pricing/n2"
				>
					Lihat Detail N2
				</a>
			</div>

			<!-- N1 -->
			<div
				class="flex flex-col justify-between rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-sm transition-all hover:shadow-md"
				use:viewportReveal={{ direction: 'up', delay: 400 }}
			>
				<div class="flex flex-col">
					<div class="mb-2 flex items-center justify-between">
						<span
							class="rounded-full bg-surface-container-highest px-2.5 py-0.5 font-label-sm text-label-sm font-bold text-on-surface"
						>
							N1
						</span>
						<span
							class="rounded-full bg-tertiary-fixed px-2.5 py-0.5 font-label-sm text-[10px] font-bold text-on-tertiary-fixed"
						>
							Tingkat Tertinggi
						</span>
					</div>
					<h3 class="mb-0.5 font-headline-sm text-[18px] font-bold text-on-surface">JLPT N1</h3>
					<p class="mb-3 font-body-sm text-[12px] text-on-surface-variant">
						{n1.description}
					</p>
					<div class="mb-4">
						<div class="text-[22px] leading-none font-bold text-on-surface">{n1.amount}</div>
						<div class="mt-0.5 text-[11px] text-outline">{n1.subtitle}</div>
					</div>
					<div
						class="mb-6 space-y-2 border-t border-outline-variant/30 pt-3 font-body-sm text-[12px] text-on-surface-variant"
					>
						{#each n1.points as point}
							<div class="flex items-start gap-1.5">
								<CircleCheck class="mt-0.5 size-4 shrink-0 text-primary-container" />
								<span>{point}</span>
							</div>
						{/each}
					</div>
				</div>
				<a
					class="block w-full rounded-full bg-surface-container py-2.5 text-center font-label-md text-label-md font-bold text-on-surface transition-colors hover:bg-surface-container-high"
					href="/pricing/n1"
				>
					Lihat Detail N1
				</a>
			</div>
		</div>
	</div>
</section>
