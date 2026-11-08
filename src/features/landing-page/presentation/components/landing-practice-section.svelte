<script lang="ts">
	import { Check, ClipboardCheck, Lightbulb, Timer } from 'lucide-svelte';
	import { viewportReveal } from '$lib/actions/viewport-reveal';

	let {
		selectedExamOption = $bindable('B')
	}: {
		selectedExamOption?: 'A' | 'B' | 'C' | 'D';
	} = $props();
</script>

<!-- FEATURE 4: LATIHAN INTERAKTIF & SIMULASI UJIAN JLPT -->
<section class="w-full scroll-mt-24 bg-surface py-space-xl" id="latihan">
	<div class="mx-auto max-w-7xl px-gutter">
		<div class="mx-auto mb-space-xl max-w-2xl text-center" use:viewportReveal={{ direction: 'up' }}>
			<div class="mb-space-sm inline-flex items-center gap-1.5 rounded-full bg-surface-container-highest px-3 py-1 font-semibold text-label-sm text-on-surface">
				<ClipboardCheck class="size-4 text-primary-container" />
				Simulasi Standar Resmi
			</div>
			<h2 class="mb-2 font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">
				Latihan Interaktif &amp; Simulasi Ujian JLPT
			</h2>
			<p class="font-body-md text-body-md text-on-surface-variant">
				Uji kesiapan dengan format tes sama persis seperti hari ujian JLPT sesungguhnya, lengkap dengan penghitung waktu mundur otomatis dan diagnostik kelemahan.
			</p>
		</div>

		<!-- Exam Simulator Component -->
		<div class="mx-auto max-w-4xl rounded-3xl bg-surface-container-lowest p-6 shadow-md sm:p-8" use:viewportReveal={{ direction: 'up', delay: 150 }}>
			<!-- Simulation Header Bar -->
			<div class="mb-6 flex flex-wrap items-center justify-between gap-4 pb-4">
				<div class="flex items-center gap-3">
					<span class="rounded-full bg-on-surface px-3 py-1 font-headline-sm text-label-md font-bold text-surface">Simulasi JLPT N5</span>
					<span class="font-medium text-body-sm text-on-surface-variant">Sesi: Moji • Goi (Huruf &amp; Kosakata)</span>
				</div>
				<div class="flex items-center gap-2 rounded-full bg-secondary-fixed px-4 py-1.5 font-bold font-label-sm text-label-sm text-on-secondary-fixed">
					<Timer class="size-4" />
					<span>Sisa Waktu: 00:24:18</span>
				</div>
			</div>

			<!-- Question Body Box -->
			<div class="mb-6">
				<div class="mb-2 flex items-center gap-2 text-label-sm text-outline">
					<span>Soal No. 4 dari 25</span>
					<span>•</span>
					<span class="font-semibold text-primary-container">Tipe: Partikel Tata Bahasa</span>
				</div>
				<div class="mb-4 rounded-2xl bg-surface-container-low p-5">
					<p class="mb-1 font-japanese-kana-md text-japanese-kana-md font-semibold text-on-surface">
						わたし <span class="mx-1 inline-block rounded-lg bg-surface-container-lowest px-3 py-0.5 font-bold text-primary-container shadow-xs">_____</span> 日本語をべんきょうします。
					</p>
					<p class="font-body-sm text-body-sm text-outline">
						Watashi _____ nihongo o benkyou shimasu. (Saya belajar bahasa Jepang).
					</p>
				</div>

				<!-- Multiple Choice Options -->
				<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<!-- Option A -->
					<button
						type="button"
						onclick={() => (selectedExamOption = 'A')}
						class="flex items-center justify-between rounded-2xl p-3.5 text-left transition-colors {selectedExamOption === 'A'
							? 'bg-primary-container !text-white text-white shadow-sm'
							: 'bg-surface-container-low text-on-surface hover:bg-surface-container'}"
					>
						<span class="flex items-center gap-3">
							<span class="flex size-6 items-center justify-center rounded-full text-xs font-bold {selectedExamOption === 'A' ? 'bg-on-primary text-primary-container' : 'bg-surface-container-highest text-on-surface'}">A</span>
							<span class="font-japanese-kana-md text-body-lg font-semibold">に (ni)</span>
						</span>
					</button>

					<!-- Option B (Correct) -->
					<button
						type="button"
						onclick={() => (selectedExamOption = 'B')}
						class="flex items-center justify-between rounded-2xl p-3.5 text-left transition-colors {selectedExamOption === 'B'
							? 'bg-primary-container !text-white text-white shadow-sm'
							: 'bg-surface-container-low text-on-surface hover:bg-surface-container'}"
					>
						<span class="flex items-center gap-3">
							<span class="flex size-6 items-center justify-center rounded-full text-xs font-bold {selectedExamOption === 'B' ? 'bg-on-primary text-primary-container' : 'bg-surface-container-highest text-on-surface'}">B</span>
							<span class="font-japanese-kana-md text-body-lg font-bold">は (wa)</span>
						</span>
						{#if selectedExamOption === 'B'}
							<Check class="size-[18px]" />
						{/if}
					</button>

					<!-- Option C -->
					<button
						type="button"
						onclick={() => (selectedExamOption = 'C')}
						class="flex items-center justify-between rounded-2xl p-3.5 text-left transition-colors {selectedExamOption === 'C'
							? 'bg-primary-container !text-white text-white shadow-sm'
							: 'bg-surface-container-low text-on-surface hover:bg-surface-container'}"
					>
						<span class="flex items-center gap-3">
							<span class="flex size-6 items-center justify-center rounded-full text-xs font-bold {selectedExamOption === 'C' ? 'bg-on-primary text-primary-container' : 'bg-surface-container-highest text-on-surface'}">C</span>
							<span class="font-japanese-kana-md text-body-lg font-semibold">で (de)</span>
						</span>
					</button>

					<!-- Option D -->
					<button
						type="button"
						onclick={() => (selectedExamOption = 'D')}
						class="flex items-center justify-between rounded-2xl p-3.5 text-left transition-colors {selectedExamOption === 'D'
							? 'bg-primary-container !text-white text-white shadow-sm'
							: 'bg-surface-container-low text-on-surface hover:bg-surface-container'}"
					>
						<span class="flex items-center gap-3">
							<span class="flex size-6 items-center justify-center rounded-full text-xs font-bold {selectedExamOption === 'D' ? 'bg-on-primary text-primary-container' : 'bg-surface-container-highest text-on-surface'}">D</span>
							<span class="font-japanese-kana-md text-body-lg font-semibold">を (wo)</span>
						</span>
					</button>
				</div>
			</div>

			<!-- Feedback & Explanation Inset -->
			<div class="flex items-start gap-3 rounded-2xl bg-surface-container-high/60 p-4">
				<Lightbulb class="mt-0.5 size-5 shrink-0 text-primary-container" />
				<div class="font-body-sm text-body-sm text-on-surface">
					<span class="font-bold">Penjelasan Sensei:</span> Partikel <strong>は (wa)</strong> berfungsi sebagai penanda topik utama kalimat ("Saya"). Sedangkan objek pembelajaran ditandai dengan partikel を (wo).
				</div>
			</div>
		</div>
	</div>
</section>
