<script lang="ts">
	import { Info, UserCheck, CheckCircle2, Check } from 'lucide-svelte';
	import { viewportReveal } from '$lib/actions/viewport-reveal';

	interface Props {
		prerequisites?: string[];
		targetAudience?: string[];
	}

	const DEFAULT_PREREQUISITES = [
		'Perangkat smartphone Android/iOS atau laptop dengan koneksi internet aktif.',
		'Komitmen belajar santai 15–30 menit setiap hari untuk hasil optimal.',
		'Dapat belajar mandiri kapan saja sesuai dengan waktu luang Anda.'
	];

	const DEFAULT_TARGET_AUDIENCE = [
		'Pelajar & Mahasiswa yang merencanakan studi lanjut / program pertukaran ke Jepang.',
		'Pencari kerja untuk program Tokutei Ginou (SSW) atau Magang Kerja (Kenshusei).',
		'Pecinta bahasa, budaya Jepang, anime, dan manga yang ingin memahami bahasa Jepang nyata.'
	];

	let { prerequisites = DEFAULT_PREREQUISITES, targetAudience = DEFAULT_TARGET_AUDIENCE }: Props =
		$props();
</script>

<!-- Prasyarat & Target Peserta -->
<section
	class="rounded-2xl border border-outline-variant/20 bg-white p-6 shadow-md sm:p-8"
	use:viewportReveal={{ direction: 'up' }}
>
	<h2 class="mb-6 font-headline-lg text-xl font-bold text-on-surface sm:text-2xl">
		Prasyarat &amp; Target Peserta
	</h2>
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div
			class="rounded-xl bg-surface-container-low p-5"
			use:viewportReveal={{ direction: 'left', delay: 100 }}
		>
			<div class="mb-3 flex items-center gap-2">
				<Info class="size-5 text-primary" />
				<h3 class="font-headline-sm text-base font-bold text-on-surface">Prasyarat Belajar</h3>
			</div>
			<ul class="space-y-2.5 font-body-md text-sm text-on-surface-variant">
				{#each prerequisites as item (item)}
					<li class="flex items-start gap-2">
						<CheckCircle2 class="mt-0.5 size-4 shrink-0 text-primary" />
						<span>{item}</span>
					</li>
				{/each}
			</ul>
		</div>

		<div
			class="rounded-xl bg-surface-container-low p-5"
			use:viewportReveal={{ direction: 'right', delay: 200 }}
		>
			<div class="mb-3 flex items-center gap-2">
				<UserCheck class="size-5 text-primary" />
				<h3 class="font-headline-sm text-base font-bold text-on-surface">Cocok Untuk Siapa?</h3>
			</div>
			<ul class="space-y-2.5 font-body-md text-sm text-on-surface-variant">
				{#each targetAudience as item (item)}
					<li class="flex items-start gap-2">
						<Check class="mt-0.5 size-4 shrink-0 text-secondary" />
						<span>{item}</span>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</section>
