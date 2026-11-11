<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PricingDetail } from '$features/landing-page/domain/entities/landing-pricing.entity';
	import type { AuthUser } from '$features/auth/domain/entities/auth.entity';
	import { LockOpen, ShoppingCart, PlayCircle, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-svelte';
	import { viewportReveal } from '$lib/actions/viewport-reveal';
	import { formatRupiah } from '../utils/landing-pricing-format';

	interface Props {
		detail: PricingDetail;
		user?: AuthUser | null;
		isNavigating?: boolean;
		onBuyPackage: () => void;
	}

	let { detail, user = null, isNavigating = false, onBuyPackage }: Props = $props();
</script>

<aside class="sticky top-24 w-full space-y-6 lg:col-span-4">
	<div
		class="relative overflow-hidden rounded-2xl border border-outline-variant/30 bg-white p-6 shadow-md sm:p-7"
		use:viewportReveal={{ direction: 'right', delay: 150 }}
	>
		<!-- Card Header & Pricing -->
		<div class="pt-2">
			<span
				class="font-label-sm text-xs font-bold tracking-wider text-on-surface-variant uppercase"
			>
				Investasi Belajar Sekali Seumur Hidup
			</span>
			<div class="mt-2.5 flex items-baseline gap-2">
				<span
					class="font-headline-lg text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl"
				>
					{formatRupiah(detail.price)}
				</span>
			</div>
		</div>

		<!-- Payment Type Badge -->
		<div class="mt-4 flex items-center gap-2 rounded-xl bg-surface-container p-3 text-on-surface">
			<LockOpen class="size-4.5 shrink-0 text-primary" />
			<span class="font-label-sm text-xs font-medium">
				Sekali Bayar • Bebas Akses Selamanya (Lifetime)
			</span>
		</div>

		<!-- CTAs -->
		<div class="mt-6 space-y-3">
			<button
				class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary-container px-6 py-3.5 font-label-lg text-sm font-bold text-on-primary shadow-md transition-all duration-200 hover:bg-landing-primary active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-75"
				type="button"
				disabled={isNavigating}
				onclick={onBuyPackage}
			>
				{#if isNavigating}
					<Loader2 class="size-4.5 animate-spin" />
					<span>Memproses Pembayaran...</span>
				{:else}
					<ShoppingCart class="size-4.5" />
					<span>Beli Paket {detail.code} Sekarang</span>
				{/if}
			</button>

			<a
				class="flex w-full items-center justify-center gap-2 rounded-full bg-surface px-4 py-3 text-center font-label-md text-xs font-semibold text-on-surface shadow-xs transition-colors duration-200 hover:bg-surface-container sm:text-sm"
				href={resolve(user ? '/courses' : '/register')}
			>
				<PlayCircle class="size-4 text-on-surface-variant" />
				Coba Modul Pengenalan Gratis
			</a>
		</div>

		<!-- Guarantee Badge -->
		<div class="mt-5 flex items-center gap-3 rounded-xl bg-surface-container-low p-3">
			<div
				class="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container"
			>
				<ShieldCheck class="size-5" />
			</div>
			<div>
				<div class="font-label-sm text-xs font-bold text-on-surface">
					Garansi 7 Hari Uang Kembali 100%
				</div>
				<div class="font-body-sm text-xs text-on-surface-variant">
					Tanpa resiko, jaminan kepuasan materi
				</div>
			</div>
		</div>

		<!-- Features Instant Checklist (dynamic points from DB) -->
		{#if detail.points && detail.points.length > 0}
			<div class="mt-6 space-y-3 border-t border-outline-variant/30 pt-5">
				<div class="font-label-md text-xs font-bold text-on-surface">
					Paket Termasuk Semua Fitur Ini:
				</div>
				<ul class="space-y-2.5 font-body-sm text-xs text-on-surface-variant sm:text-sm">
					{#each detail.points as point (point)}
						<li class="flex items-start gap-2">
							<CheckCircle2 class="mt-0.5 size-4 shrink-0 text-primary" />
							<span class="text-on-surface">{point}</span>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
</aside>
