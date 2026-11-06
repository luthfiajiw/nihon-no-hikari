<script lang="ts">
	import { viewportReveal } from '$lib/actions/viewport-reveal';
</script>

<!-- SECTION 5: PILIHAN PAKET & HARGA -->
<section class="w-full scroll-mt-24 bg-surface-container-low py-space-xl" id="harga">
	<div class="mx-auto max-w-7xl px-gutter">
		<div class="mx-auto mb-space-xl max-w-3xl text-center" use:viewportReveal={{ direction: 'up' }}>
			<div class="mb-space-sm inline-flex items-center gap-1.5 rounded-full bg-primary-fixed px-3.5 py-1 font-semibold text-label-sm text-on-primary-fixed">
				<span class="material-symbols-outlined text-[16px]">sell</span> Pilihan Paket &amp; Investasi Belajar
			</div>
			<h2 class="mb-2 font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">
				Pilih Paket Belajar Sesuai Target JLPT Anda
			</h2>
			<p class="mx-auto max-w-2xl font-body-md text-body-md text-on-surface-variant">
				Akses modul terstruktur, ribuan flashcard kosakata SRS, latihan soal simulasi resmi, dan AI Sensei personal tutor. Pilih satuan level atau paket hemat bertahap.
			</p>
			<div class="mt-4 inline-flex items-center gap-2 rounded-full bg-surface-container-highest px-4 py-1.5 font-semibold text-label-sm text-on-surface">
				<span class="material-symbols-outlined text-[16px] text-primary-container">verified</span>
				Akses Sekali Bayar (Lifetime Access) • Garansi Update Materi
			</div>
		</div>

		<div class="mb-space-lg grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 lg:grid-cols-5">
			<!-- N5 -->
			<div class="flex flex-col justify-between rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-sm transition-all hover:shadow-md" use:viewportReveal={{ direction: 'up', delay: 80 }}>
				<div class="flex flex-col">
					<div class="mb-2 flex items-center justify-between">
						<span class="rounded-full bg-surface-container-highest px-2.5 py-0.5 font-bold font-label-sm text-label-sm text-on-surface">N5</span>
						<span class="rounded-full bg-secondary-fixed px-2 py-0.5 text-[10px] font-bold font-label-sm text-on-secondary-fixed">Favorit Pemula</span>
					</div>
					<h3 class="mb-0.5 font-headline-sm text-[18px] font-bold text-on-surface">JLPT N5</h3>
					<p class="mb-3 font-body-sm text-[12px] text-on-surface-variant">Pemula Dasar (0 → N5)</p>
					<div class="mb-4">
						<div class="text-[22px] font-bold leading-none text-on-surface">Rp 149.000</div>
						<div class="mt-0.5 text-[11px] text-outline">Sekali bayar • Akses selamanya</div>
					</div>
					<div class="mb-6 space-y-2 border-t border-outline-variant/30 pt-3 font-body-sm text-[12px] text-on-surface-variant">
						<div class="flex items-start gap-1.5">
							<span class="material-symbols-outlined mt-0.5 text-[15px] text-primary-container">check_circle</span>
							<span>Modul Hiragana &amp; Katakana lengkap</span>
						</div>
						<div class="flex items-start gap-1.5">
							<span class="material-symbols-outlined mt-0.5 text-[15px] text-primary-container">check_circle</span>
							<span>800+ Flashcards audio penutur asli</span>
						</div>
						<div class="flex items-start gap-1.5">
							<span class="material-symbols-outlined mt-0.5 text-[15px] text-primary-container">check_circle</span>
							<span>15 Bab tata bahasa dasar &amp; 100 Kanji</span>
						</div>
						<div class="flex items-start gap-1.5">
							<span class="material-symbols-outlined mt-0.5 text-[15px] text-primary-container">check_circle</span>
							<span>3x Simulasi Ujian JLPT N5</span>
						</div>
						<div class="flex items-start gap-1.5">
							<span class="material-symbols-outlined mt-0.5 text-[15px] text-primary-container">check_circle</span>
							<span>AI Sensei Tutor 24/7</span>
						</div>
					</div>
				</div>
				<a
					class="block w-full rounded-full bg-surface-container py-2.5 text-center font-label-md text-label-md font-bold text-on-surface transition-colors hover:bg-surface-container-high"
					href="/register"
				>
					Pilih N5
				</a>
			</div>

			<!-- N4 -->
			<div class="flex flex-col justify-between rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-sm transition-all hover:shadow-md" use:viewportReveal={{ direction: 'up', delay: 160 }}>
				<div class="flex flex-col">
					<div class="mb-2 flex items-center justify-between">
						<span class="rounded-full bg-surface-container-highest px-2.5 py-0.5 font-bold font-label-sm text-label-sm text-on-surface">N4</span>
						<span class="text-[11px] font-medium text-outline">Pemula Lanjut</span>
					</div>
					<h3 class="mb-0.5 font-headline-sm text-[18px] font-bold text-on-surface">JLPT N4</h3>
					<p class="mb-3 font-body-sm text-[12px] text-on-surface-variant">Percakapan &amp; Kalimat Majemuk</p>
					<div class="mb-4">
						<div class="text-[22px] font-bold leading-none text-on-surface">Rp 199.000</div>
						<div class="mt-0.5 text-[11px] text-outline">Sekali bayar • Akses selamanya</div>
					</div>
					<div class="mb-6 space-y-2 border-t border-outline-variant/30 pt-3 font-body-sm text-[12px] text-on-surface-variant">
						<div class="flex items-start gap-1.5">
							<span class="material-symbols-outlined mt-0.5 text-[15px] text-primary-container">check_circle</span>
							<span>14 Materi percakapan kontekstual</span>
						</div>
						<div class="flex items-start gap-1.5">
							<span class="material-symbols-outlined mt-0.5 text-[15px] text-primary-container">check_circle</span>
							<span>Bank pola tata bahasa (Bunpo) N4</span>
						</div>
						<div class="flex items-start gap-1.5">
							<span class="material-symbols-outlined mt-0.5 text-[15px] text-primary-container">check_circle</span>
							<span>1.500 Kosakata &amp; 300 Kanji SRS</span>
						</div>
						<div class="flex items-start gap-1.5">
							<span class="material-symbols-outlined mt-0.5 text-[15px] text-primary-container">check_circle</span>
							<span>5x Simulasi Ujian JLPT N4</span>
						</div>
						<div class="flex items-start gap-1.5">
							<span class="material-symbols-outlined mt-0.5 text-[15px] text-primary-container">check_circle</span>
							<span>Penjadwalan belajar AI adaptif</span>
						</div>
					</div>
				</div>
				<a
					class="block w-full rounded-full bg-surface-container py-2.5 text-center font-label-md text-label-md font-bold text-on-surface transition-colors hover:bg-surface-container-high"
					href="/register"
				>
					Pilih N4
				</a>
			</div>

			<!-- N3 (Populer) -->
			<div class="relative flex flex-col justify-between rounded-3xl border-2 border-primary-container bg-surface-container-lowest p-5 shadow-md transition-all hover:shadow-lg" use:viewportReveal={{ direction: 'up', delay: 240 }}>
				<div class="flex flex-col">
					<div class="mb-2 flex items-center justify-between">
						<span class="rounded-full bg-primary-container px-2.5 py-0.5 font-bold font-label-sm text-label-sm !text-white text-white">N3</span>
						<span class="rounded-full bg-primary-fixed px-2 py-0.5 text-[10px] font-bold font-label-sm text-on-primary-fixed">Paling Populer</span>
					</div>
					<h3 class="mb-0.5 font-headline-sm text-[18px] font-bold text-on-surface">JLPT N3</h3>
					<p class="mb-3 font-body-sm text-[12px] text-on-surface-variant">Menengah Mandiri (Best Value)</p>
					<div class="mb-4">
						<div class="text-[22px] font-bold leading-none text-primary-container">Rp 249.000</div>
						<div class="mt-0.5 text-[11px] text-outline">Sekali bayar • Akses selamanya</div>
					</div>
					<div class="mb-6 space-y-2 border-t border-outline-variant/30 pt-3 font-body-sm text-[12px] text-on-surface-variant">
						<div class="flex items-start gap-1.5">
							<span class="material-symbols-outlined mt-0.5 text-[15px] text-primary-container">check_circle</span>
							<span>650 Kanji &amp; 3.750 Kosakata lengkap</span>
						</div>
						<div class="flex items-start gap-1.5">
							<span class="material-symbols-outlined mt-0.5 text-[15px] text-primary-container">check_circle</span>
							<span>Dokkai &amp; Choukai intensif standar ujian</span>
						</div>
						<div class="flex items-start gap-1.5">
							<span class="material-symbols-outlined mt-0.5 text-[15px] text-primary-container">check_circle</span>
							<span>Analisis kelemahan AI otomatis</span>
						</div>
						<div class="flex items-start gap-1.5">
							<span class="material-symbols-outlined mt-0.5 text-[15px] text-primary-container">check_circle</span>
							<span>8x Simulasi Tryout N3 dengan timer</span>
						</div>
						<div class="flex items-start gap-1.5">
							<span class="material-symbols-outlined mt-0.5 text-[15px] text-primary-container">check_circle</span>
							<span>Diskusi komunitas &amp; bimbingan Sensei</span>
						</div>
					</div>
				</div>
				<a
					class="landing-btn-primary block w-full rounded-full bg-primary-container py-2.5 text-center font-label-md text-label-md font-bold !text-white text-white shadow-sm transition-colors hover:bg-landing-primary"
					href="/register"
				>
					<span class="!text-white text-white">Pilih N3</span>
				</a>
			</div>

			<!-- N2 -->
			<div class="flex flex-col justify-between rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-sm transition-all hover:shadow-md" use:viewportReveal={{ direction: 'up', delay: 320 }}>
				<div class="flex flex-col">
					<div class="mb-2 flex items-center justify-between">
						<span class="rounded-full bg-surface-container-highest px-2.5 py-0.5 font-bold font-label-sm text-label-sm text-on-surface">N2</span>
						<span class="text-[11px] font-medium text-outline">Bisnis &amp; Kerja</span>
					</div>
					<h3 class="mb-0.5 font-headline-sm text-[18px] font-bold text-on-surface">JLPT N2</h3>
					<p class="mb-3 font-body-sm text-[12px] text-on-surface-variant">Akademik &amp; Karir Jepang</p>
					<div class="mb-4">
						<div class="text-[22px] font-bold leading-none text-on-surface">Rp 299.000</div>
						<div class="mt-0.5 text-[11px] text-outline">Sekali bayar • Akses selamanya</div>
					</div>
					<div class="mb-6 space-y-2 border-t border-outline-variant/30 pt-3 font-body-sm text-[12px] text-on-surface-variant">
						<div class="flex items-start gap-1.5">
							<span class="material-symbols-outlined mt-0.5 text-[15px] text-primary-container">check_circle</span>
							<span>Artikel berita &amp; ekspresi bisnis formal</span>
						</div>
						<div class="flex items-start gap-1.5">
							<span class="material-symbols-outlined mt-0.5 text-[15px] text-primary-container">check_circle</span>
							<span>Pelatihan Choukai tempo asli Jepang</span>
						</div>
						<div class="flex items-start gap-1.5">
							<span class="material-symbols-outlined mt-0.5 text-[15px] text-primary-container">check_circle</span>
							<span>1.000 Kanji &amp; 6.000 Kosakata bisnis</span>
						</div>
						<div class="flex items-start gap-1.5">
							<span class="material-symbols-outlined mt-0.5 text-[15px] text-primary-container">check_circle</span>
							<span>10x Tryout N2 resmi dengan pembahasan</span>
						</div>
						<div class="flex items-start gap-1.5">
							<span class="material-symbols-outlined mt-0.5 text-[15px] text-primary-container">check_circle</span>
							<span>Feedback AI Essay &amp; Dokkai mendalam</span>
						</div>
					</div>
				</div>
				<a
					class="block w-full rounded-full bg-surface-container py-2.5 text-center font-label-md text-label-md font-bold text-on-surface transition-colors hover:bg-surface-container-high"
					href="/register"
				>
					Pilih N2
				</a>
			</div>

			<!-- N1 -->
			<div class="flex flex-col justify-between rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-sm transition-all hover:shadow-md" use:viewportReveal={{ direction: 'up', delay: 400 }}>
				<div class="flex flex-col">
					<div class="mb-2 flex items-center justify-between">
						<span class="rounded-full bg-surface-container-highest px-2.5 py-0.5 font-bold font-label-sm text-label-sm text-on-surface">N1</span>
						<span class="rounded-full bg-tertiary-fixed px-2.5 py-0.5 text-[10px] font-bold font-label-sm text-on-tertiary-fixed">Tingkat Tertinggi</span>
					</div>
					<h3 class="mb-0.5 font-headline-sm text-[18px] font-bold text-on-surface">JLPT N1</h3>
					<p class="mb-3 font-body-sm text-[12px] text-on-surface-variant">Penutur Mahir &amp; Profesional</p>
					<div class="mb-4">
						<div class="text-[22px] font-bold leading-none text-on-surface">Rp 349.000</div>
						<div class="mt-0.5 text-[11px] text-outline">Sekali bayar • Akses selamanya</div>
					</div>
					<div class="mb-6 space-y-2 border-t border-outline-variant/30 pt-3 font-body-sm text-[12px] text-on-surface-variant">
						<div class="flex items-start gap-1.5">
							<span class="material-symbols-outlined mt-0.5 text-[15px] text-primary-container">check_circle</span>
							<span>Nuansa bahasa idiomatis tingkat tinggi</span>
						</div>
						<div class="flex items-start gap-1.5">
							<span class="material-symbols-outlined mt-0.5 text-[15px] text-primary-container">check_circle</span>
							<span>Materi debat, opini &amp; editorial koran</span>
						</div>
						<div class="flex items-start gap-1.5">
							<span class="material-symbols-outlined mt-0.5 text-[15px] text-primary-container">check_circle</span>
							<span>2.000 Kanji &amp; 10.000 Kosakata komplit</span>
						</div>
						<div class="flex items-start gap-1.5">
							<span class="material-symbols-outlined mt-0.5 text-[15px] text-primary-container">check_circle</span>
							<span>Tryout N1 tanpa batas &amp; simulasi nyata</span>
						</div>
						<div class="flex items-start gap-1.5">
							<span class="material-symbols-outlined mt-0.5 text-[15px] text-primary-container">check_circle</span>
							<span>Simulasi wawancara kerja &amp; beasiswa AI</span>
						</div>
					</div>
				</div>
				<a
					class="block w-full rounded-full bg-surface-container py-2.5 text-center font-label-md text-label-md font-bold text-on-surface transition-colors hover:bg-surface-container-high"
					href="/register"
				>
					Pilih N1
				</a>
			</div>
		</div>
	</div>
</section>
