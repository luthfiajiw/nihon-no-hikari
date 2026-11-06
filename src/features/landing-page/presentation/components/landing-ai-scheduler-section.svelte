<script lang="ts">
	import { viewportReveal } from '$lib/actions/viewport-reveal';
</script>

<!-- FEATURE 3: JADWAL BELAJAR PERSONAL BERBASIS AI -->
<section class="w-full scroll-mt-24 bg-surface-container-low py-space-xl" id="ai-scheduler">
	<div class="mx-auto max-w-7xl px-gutter">
		<div class="grid grid-cols-1 items-center gap-space-xl lg:grid-cols-12">
			<!-- Left: Explanatory points -->
			<div class="flex flex-col justify-center lg:col-span-5" use:viewportReveal={{ direction: 'left', delay: 100 }}>
				<div class="mb-space-sm inline-flex w-fit items-center gap-1.5 rounded-full bg-primary-fixed px-3 py-1 font-semibold text-label-sm text-on-primary-fixed">
					<span class="material-symbols-outlined text-[16px]">auto_awesome</span>
					AI Sensei Assistant
				</div>
				<h2 class="mb-space-sm font-headline-lg text-headline-lg font-bold leading-tight tracking-tight text-on-surface">
					Jadwal Belajar Personal Berbasis Kecerdasan AI
				</h2>
				<p class="mb-space-lg font-body-md text-body-md leading-relaxed text-on-surface-variant">
					Tidak punya banyak waktu luang? Cukup tentukan target kelulusan JLPT Anda dan AI Ganbare akan merancang jadwal belajar harian mikro (15–30 menit) yang realistis serta fleksibel.
				</p>
				<div class="mb-space-lg space-y-space-md">
					<div class="flex items-start gap-3 rounded-2xl bg-surface-container-lowest p-3.5 shadow-sm">
						<span class="material-symbols-outlined mt-0.5 text-[22px] text-primary-container">event_repeat</span>
						<div>
							<h4 class="font-label-lg text-label-lg font-bold text-on-surface">AI Adaptive Rescheduling</h4>
							<p class="font-body-sm text-body-sm text-on-surface-variant">
								Jika Anda terlewat belajar di hari sibuk, AI akan membagi beban materi secara otomatis ke hari berikutnya tanpa menimbulkan rasa kewalahan.
							</p>
						</div>
					</div>
					<div class="flex items-start gap-3 rounded-2xl bg-surface-container-lowest p-3.5 shadow-sm">
						<span class="material-symbols-outlined mt-0.5 text-[22px] text-primary-container">chat_bubble</span>
						<div>
							<h4 class="font-label-lg text-label-lg font-bold text-on-surface">Tanya Sensei AI 24/7</h4>
							<p class="font-body-sm text-body-sm text-on-surface-variant">
								Tanyakan nuansa perbedaan partikel seperti <em>'wa' vs 'ga'</em> kapan saja dalam bahasa Indonesia yang mudah dipahami.
							</p>
						</div>
					</div>
				</div>
				<a
					class="inline-flex items-center gap-2 font-label-lg text-label-lg font-semibold text-primary-container hover:underline"
					href="/register"
				>
					<span>Uji Coba Rencana Belajar AI Gratis</span>
					<span class="material-symbols-outlined text-[18px]">east</span>
				</a>
			</div>

			<!-- Right: AI Study Planner Showcase Widget -->
			<div class="rounded-3xl bg-surface-container-lowest p-6 shadow-md lg:col-span-7" use:viewportReveal={{ direction: 'right', delay: 150 }}>
				<!-- Planner Header Settings -->
				<div class="mb-4 flex flex-col justify-between gap-3 rounded-2xl bg-surface-container-low p-4 sm:flex-row sm:items-center">
					<div>
						<div class="text-[11px] font-bold tracking-wider text-outline uppercase">Rencana Aktif Anda</div>
						<div class="font-headline-sm text-body-lg font-bold text-on-surface">Target: Lulus JLPT N5 dalam 90 Hari</div>
						<div class="text-body-sm text-outline">Komitmen: 30 menit / hari (Target Skor ≥ 140/180)</div>
					</div>
					<div class="self-start rounded-full bg-secondary-fixed px-3.5 py-1.5 font-semibold text-label-sm text-on-secondary-fixed sm:self-center">
						Fokus: Kosakata &amp; Partikel
					</div>
				</div>

				<!-- Weekly Schedule Card Grid -->
				<div class="mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
					<div class="rounded-2xl bg-surface-container p-3 text-on-surface shadow-xs">
						<div class="mb-1 flex items-center justify-between text-[11px] font-bold text-primary-container">
							<span>SENIN</span>
							<span class="material-symbols-outlined text-[14px]">check_circle</span>
						</div>
						<div class="font-label-md text-label-md font-semibold text-on-surface">20 Kanji Dasar</div>
						<div class="mt-0.5 text-[11px] text-outline">Selesai • 25 mnt</div>
					</div>
					<div class="rounded-2xl bg-surface-container p-3 text-on-surface shadow-xs">
						<div class="mb-1 flex items-center justify-between text-[11px] font-bold text-primary-container">
							<span>SELASA</span>
							<span class="material-symbols-outlined text-[14px]">check_circle</span>
						</div>
						<div class="font-label-md text-label-md font-semibold text-on-surface">Choukai Audio</div>
						<div class="mt-0.5 text-[11px] text-outline">Selesai • 30 mnt</div>
					</div>
					<div class="rounded-2xl bg-primary-container p-3 text-white shadow-sm">
						<div class="mb-1 flex items-center justify-between text-[11px] font-bold text-white/90">
							<span>HARI INI (RABU)</span>
							<span class="size-2 animate-ping rounded-full bg-secondary-fixed"></span>
						</div>
						<div class="font-label-md text-label-md font-bold text-white">Tata Bahasa 'wa/ga'</div>
						<div class="mt-0.5 text-[11px] text-white/80">3 Modul • 30 mnt</div>
					</div>
					<div class="rounded-2xl bg-surface-container-low p-3 text-on-surface">
						<div class="mb-1 flex items-center justify-between text-[11px] font-bold text-outline">
							<span>KAMIS</span>
							<span class="material-symbols-outlined text-[14px] text-outline">schedule</span>
						</div>
						<div class="font-label-md text-label-md font-semibold text-on-surface">Review SRS Harian</div>
						<div class="mt-0.5 text-[11px] text-outline">35 Kartu kosakata</div>
					</div>
					<div class="rounded-2xl bg-surface-container-low p-3 text-on-surface">
						<div class="mb-1 flex items-center justify-between text-[11px] font-bold text-outline">
							<span>JUMAT</span>
							<span class="material-symbols-outlined text-[14px] text-outline">schedule</span>
						</div>
						<div class="font-label-md text-label-md font-semibold text-on-surface">Latihan Soal Dokkai</div>
						<div class="mt-0.5 text-[11px] text-outline">2 Wacana pendek</div>
					</div>
					<div class="rounded-2xl bg-surface-container-low p-3 text-on-surface">
						<div class="mb-1 flex items-center justify-between text-[11px] font-bold text-outline">
							<span>SABTU</span>
							<span class="material-symbols-outlined text-[14px] text-outline">schedule</span>
						</div>
						<div class="font-label-md text-label-md font-semibold text-on-surface">Simulasi Mini Exam</div>
						<div class="mt-0.5 text-[11px] text-outline">25 Soal • Timer</div>
					</div>
				</div>

				<!-- Sensei AI Chat Pill Input Simulation -->
				<div class="flex items-center gap-2 rounded-2xl bg-surface-container-low p-3">
					<span class="material-symbols-outlined text-[20px] text-primary-container">smart_toy</span>
					<span class="truncate font-body-sm text-body-sm text-outline">"Sensei, jelaskan perbedaan penggunaan これ (kore) dan この (kono)..."</span>
					<button
						class="ml-auto rounded-full bg-primary-container px-3 py-1 font-semibold whitespace-nowrap text-label-sm !text-white text-white transition-colors hover:bg-landing-primary"
						type="button"
					>
						Tanyakan
					</button>
				</div>
			</div>
		</div>
	</div>
</section>
