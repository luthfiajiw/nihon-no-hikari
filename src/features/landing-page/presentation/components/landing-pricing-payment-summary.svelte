<script lang="ts">
	import type { PricingDetail } from '../../domain/entities/landing-pricing.entity';
	import type { PricingPaymentSummary } from '../../domain/entities/landing-pricing-payment.entity';
	import { formatRupiah } from '../utils/landing-pricing-format';
	import {
		CheckCircle2,
		Lock,
		ShieldCheck,
		Headset,
		Tag,
		X,
		LoaderCircleIcon
	} from 'lucide-svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Separator } from '$lib/components/ui/separator';
	import { viewportReveal } from '$lib/actions/viewport-reveal';

	interface Props {
		detail: PricingDetail;
		summary: PricingPaymentSummary;
		isProcessing?: boolean;
		onPay: () => void;
	}

	let { detail, summary, isProcessing = false, onPay }: Props = $props();

	let voucherCode = $state('');
	let appliedVoucher = $state<string | null>(null);
	let voucherError = $state<string | null>(null);

	function applyVoucher() {
		const code = voucherCode.trim().toUpperCase();
		if (!code) return;

		// Mock voucher validation
		if (code === 'GANBARE' || code === 'GANBAREHEMAT') {
			appliedVoucher = code;
			voucherError = null;
		} else {
			voucherError = 'Kode voucher tidak valid atau sudah kedaluwarsa.';
		}
	}

	function removeVoucher() {
		appliedVoucher = null;
		voucherCode = '';
		voucherError = null;
	}
</script>

<aside class="sticky top-24 w-full space-y-6 lg:col-span-5">
	<div
		class="flex flex-col gap-5 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-md sm:p-7"
		use:viewportReveal={{ direction: 'right', delay: 150 }}
	>
		<!-- Card Header -->
		<div class="flex items-center justify-between border-b border-outline-variant/20 pb-3">
			<span
				class="font-label-sm text-xs font-bold tracking-wider text-on-surface-variant uppercase"
			>
				Ringkasan Pesanan
			</span>
			<Badge
				variant="secondary"
				class="rounded-full bg-secondary-container px-2.5 py-0.5 font-label-sm text-xs font-semibold text-on-secondary-container"
			>
				Lifetime Access
			</Badge>
		</div>

		<!-- Product Details Card (Matches Mockup) -->
		<div class="flex flex-col rounded-2xl bg-surface-container-low p-5 sm:p-6">
			<!-- Top Row: Badge & Price -->
			<div class="flex items-center justify-between">
				<span
					class="inline-flex items-center rounded-md bg-[#5D5958] px-2.5 py-1 font-label-sm text-xs font-bold text-white shadow-xs"
				>
					{detail.code}
				</span>
				<span class="font-headline-sm text-lg font-extrabold text-[#5D5958] sm:text-xl">
					{formatRupiah(detail.price)}
				</span>
			</div>

			<!-- Title -->
			<h3 class="mt-3 font-headline-sm text-base font-bold text-on-surface sm:text-lg">
				{detail.name}
			</h3>

			<!-- Description -->
			{#if detail.description}
				<p class="mt-1.5 font-body-sm text-xs leading-relaxed text-on-surface-variant sm:text-sm">
					{detail.description}
				</p>
			{/if}

			<!-- Points Checklist -->
			{#if detail.points && detail.points.length > 0}
				<ul class="mt-4 flex flex-col gap-2.5 font-body-sm text-xs text-on-surface sm:text-sm">
					{#each detail.points as point (point)}
						<li class="flex items-start gap-2.5">
							<CheckCircle2 class="mt-0.5 size-4.5 shrink-0 text-[#5D5958]" />
							<span class="leading-snug">{point}</span>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		<!-- Voucher / Promo Code Field -->
		<div class="flex flex-col pt-1">
			<div
				class="flex items-center justify-between font-label-sm text-xs font-semibold text-on-surface"
			>
				<span>Punya Kode Promo / Voucher Belajar?</span>
			</div>

			{#if appliedVoucher}
				<div
					class="flex items-center justify-between rounded-xl bg-secondary-container/50 px-3.5 py-2.5 text-xs text-on-secondary-container"
				>
					<div class="flex items-center gap-2">
						<Tag class="size-4" />
						<span class="font-mono font-bold tracking-wider">{appliedVoucher}</span>
					</div>
					<button
						type="button"
						class="cursor-pointer text-on-secondary-container/80 transition-colors hover:text-on-secondary-container"
						onclick={removeVoucher}
						aria-label="Hapus voucher"
					>
						<X class="size-4" />
					</button>
				</div>
			{:else}
				<div class="flex items-end gap-2">
					<Input
						type="text"
						bind:value={voucherCode}
						placeholder="Contoh: GANBARE"
						class="rounded-xl border-outline-variant/30 bg-surface-container-low font-mono text-xs tracking-wider uppercase sm:text-sm"
					/>
					<Button
						type="button"
						variant="outline"
						class="rounded-xl border-outline-variant/30 bg-surface-container font-label-md text-xs font-semibold hover:bg-surface-container-high"
						onclick={applyVoucher}
					>
						Terapkan
					</Button>
				</div>
				{#if voucherError}
					<p class="font-body-sm text-xs text-error">{voucherError}</p>
				{/if}
			{/if}
		</div>

		<!-- Price Breakdown -->
		<div class="flex flex-col gap-2.5 pt-2">
			<div
				class="flex items-center justify-between font-body-sm text-xs text-on-surface-variant sm:text-sm"
			>
				<span>Harga Paket</span>
				<span class="font-medium text-on-surface">{formatRupiah(summary.subtotal)}</span>
			</div>
			<Separator class="my-1 bg-outline-variant/40" />

			<div class="flex items-center justify-between pt-1">
				<div>
					<p class="font-headline-sm text-sm font-bold text-on-surface sm:text-base">
						Total Pembayaran
					</p>
					<p class="font-label-sm text-[12px] text-on-surface-variant">
						Termasuk PPN & sertifikat kelulusan
					</p>
				</div>
				<div class="text-right">
					<span
						class="font-headline-lg text-2xl font-extrabold tracking-tight text-primary sm:text-3xl"
					>
						{formatRupiah(summary.total)}
					</span>
				</div>
			</div>
		</div>

		<!-- Primary CTA Button -->
		<div class="flex flex-col gap-2.5 pt-2">
			<button
				type="button"
				class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary-container px-6 py-4 font-headline-sm text-sm font-bold text-on-primary shadow-md transition-all hover:bg-landing-primary active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-75 sm:text-base"
				disabled={isProcessing}
				onclick={onPay}
			>
				{#if isProcessing}
					<LoaderCircleIcon data-icon="inline-start" class="animate-spin" aria-hidden="true" />
				{:else}
					<Lock class="size-4.5" />
				{/if}

				<span>
					{isProcessing
						? 'Memproses Transaksi...'
						: `Bayar Sekarang • ${formatRupiah(summary.total)}`}
				</span>
			</button>
			<p class="text-center font-body-sm text-[11px] text-on-surface-variant sm:text-xs">
				Dengan mengklik tombol di atas, Anda menyetujui Ketentuan Layanan serta Kebijakan Privasi
				Gakkobit.
			</p>
		</div>

		<!-- Refund Guarantee Banner -->
		<div
			class="flex items-start gap-3 rounded-xl border border-secondary/20 bg-secondary-container/40 p-3.5"
		>
			<ShieldCheck class="size-5" />
			<div class="flex w-full flex-col">
				<span class="font-label-md text-xs font-bold text-on-surface">
					Jaminan 100% Kepuasan Belajar
				</span>
				<span class="mt-0.5 font-body-sm text-xs text-on-surface-variant">
					Jika Anda merasa modul {detail.name} ini tidak membantu perkembangan bahasa Jepang Anda dalam
					7 hari pertama, kami kembalikan dana penuh tanpa syarat rumit.
				</span>
			</div>
		</div>

		<!-- Customer Service Help Contact -->
		<div class="flex items-center justify-between rounded-xl bg-surface-container p-3">
			<div class="flex items-center gap-2.5">
				<div
					class="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary"
				>
					<Headset class="size-4" />
				</div>
				<div>
					<p class="font-label-sm text-xs font-bold text-on-surface">Ada Kendala Pembayaran?</p>
					<p class="font-label-sm text-[11px] text-on-surface-variant">
						Hubungi Sensei Admin via WhatsApp
					</p>
				</div>
			</div>
			<a
				target="_blank"
				rel="noopener noreferrer"
				class="rounded-lg bg-surface-container-lowest px-3 py-1.5 font-label-sm text-xs font-bold text-primary shadow-sm transition-colors hover:bg-surface-bright"
			>
				Chat WA
			</a>
		</div>
	</div>
</aside>
