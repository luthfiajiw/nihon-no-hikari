<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PricingDetail } from '../../domain/entities/landing-pricing.entity';
	import { CheckCircle2, ArrowRight, Home } from 'lucide-svelte';
	import { viewportReveal } from '$lib/actions/viewport-reveal';

	interface Props {
		detail: PricingDetail;
	}

	let { detail }: Props = $props();
</script>

<div
	class="mx-auto max-w-xl rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-8 text-center shadow-lg sm:p-10"
	use:viewportReveal={{ direction: 'zoom' }}
>
	<div
		class="mx-auto flex size-16 items-center justify-center rounded-full bg-primary-container text-on-primary shadow-sm"
	>
		<CheckCircle2 class="size-9" />
	</div>

	<h2 class="mt-6 font-headline-lg text-2xl font-bold text-on-surface">
		Pembayaran Berhasil!
	</h2>

	<p class="mx-auto mt-2 max-w-md font-body-md text-sm text-on-surface-variant sm:text-base">
		Terima kasih! Simulasi proses pembayaran Paket <span class="font-semibold text-on-surface">{detail.name}</span> berhasil.
		Akses materi dan AI Sensei telah aktif seumur hidup untuk akun Anda.
	</p>

	<div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
		<a
			href={resolve('/dashboard')}
			class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-primary-container px-6 py-3.5 font-label-lg text-sm font-bold text-on-primary shadow-md transition-all hover:bg-landing-primary active:scale-[0.99]"
		>
			<span>Mulai Belajar Sekarang</span>
			<ArrowRight class="size-4" />
		</a>
		<a
			href={resolve('/')}
			class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-outline-variant/40 bg-surface-container px-6 py-3.5 font-label-lg text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-high active:scale-[0.99]"
		>
			<Home class="size-4" />
			<span>Kembali ke Beranda</span>
		</a>
	</div>
</div>
