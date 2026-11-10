<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import type { PricingDetail } from '$features/landing-page/domain/entities/landing-pricing.entity';
	import { CheckCircle2, Lock } from 'lucide-svelte';

	interface Props {
		open?: boolean;
		detail: PricingDetail;
	}

	let { open = $bindable(false), detail }: Props = $props();

	let selectedPayment = $state<'qris' | 'bca' | 'gopay' | 'card'>('qris');
	let isProcessing = $state(false);
	let paymentSuccess = $state(false);

	const paymentMethods = [
		{ id: 'qris', label: 'QRIS Instant' },
		{ id: 'bca', label: 'BCA Virtual Account' },
		{ id: 'gopay', label: 'GoPay / ShopeePay' },
		{ id: 'card', label: 'Kartu Kredit' }
	] as const;

	function formatRupiah(value: number): string {
		if (value === 0) return 'Gratis';
		return 'Rp ' + new Intl.NumberFormat('id-ID').format(value);
	}

	function handleConfirmPayment() {
		if (isProcessing) return;
		isProcessing = true;
		setTimeout(() => {
			isProcessing = false;
			paymentSuccess = true;
			setTimeout(() => {
				open = false;
				paymentSuccess = false;
			}, 1800);
		}, 1000);
	}

	$effect(() => {
		if (open) {
			paymentSuccess = false;
			isProcessing = false;
		}
	});
</script>

<Dialog.Root
	bind:open
	onOpenChange={(isOpen) => {
		if (!isOpen && isProcessing) {
			open = true;
		}
	}}
>
	<Dialog.Content class="max-w-lg rounded-2xl border border-outline-variant/40 bg-surface p-6 shadow-2xl sm:p-8">
		{#if paymentSuccess}
			<div class="space-y-4 py-8 text-center">
				<div
					class="mx-auto flex size-14 items-center justify-center rounded-full bg-primary-container text-on-primary"
				>
					<CheckCircle2 class="size-8" />
				</div>
				<Dialog.Header class="text-center">
					<Dialog.Title class="font-headline-md text-xl font-bold text-on-surface">
						Pembayaran Berhasil!
					</Dialog.Title>
					<Dialog.Description class="mx-auto max-w-sm font-body-md text-sm text-on-surface-variant">
						Terima kasih! Simulasi proses pembayaran Paket {detail.name} berhasil. Akun Anda telah diaktifkan!
					</Dialog.Description>
				</Dialog.Header>
			</div>
		{:else}
			<Dialog.Header class="mb-6 text-left">
				<div>
					<span
						class="rounded-full bg-secondary px-2.5 py-0.5 font-label-sm text-xs font-bold text-on-secondary uppercase"
					>
						Konfirmasi Pembelian
					</span>
				</div>
				<Dialog.Title class="mt-2 font-headline-md text-xl font-bold text-on-surface">
					Paket Belajar {detail.name} Lengkap
				</Dialog.Title>
				<Dialog.Description class="font-body-sm text-xs text-on-surface-variant">
					Akses seumur hidup langsung aktif setelah pembayaran diverifikasi.
				</Dialog.Description>
			</Dialog.Header>

			<!-- Payment Summary Table -->
			<div class="mb-6 space-y-2 rounded-xl bg-surface-container p-4 font-body-md text-sm">
				<div class="flex justify-between text-on-surface-variant">
					<span>Harga Paket</span>
					<span class="font-medium text-on-surface">{formatRupiah(detail.price)}</span>
				</div>
				<div
					class="flex justify-between border-t border-outline-variant/20 pt-2 font-headline-sm text-base font-bold text-on-surface"
				>
					<span>Total Pembayaran</span>
					<span class="font-bold text-primary">{formatRupiah(detail.price)}</span>
				</div>
			</div>

			<!-- Payment Method Selection -->
			<div class="mb-6 space-y-3">
				<span class="block font-label-sm text-xs font-bold text-on-surface">
					Pilih Metode Pembayaran Cepat:
				</span>
				<div class="grid grid-cols-2 gap-2 text-xs font-medium">
					{#each paymentMethods as method (method.id)}
						<label
							class="flex cursor-pointer items-center gap-2 rounded-xl bg-surface-container-low p-3 transition-colors hover:bg-surface-container {selectedPayment ===
							method.id
								? 'bg-surface-container ring-2 ring-primary-container'
								: ''}"
						>
							<input
								type="radio"
								name="payment-method"
								value={method.id}
								checked={selectedPayment === method.id}
								onchange={() => (selectedPayment = method.id)}
								class="text-primary focus:ring-primary"
							/>
							<span class="font-semibold text-on-surface">{method.label}</span>
						</label>
					{/each}
				</div>
			</div>

			<!-- Action Button -->
			<button
				class="w-full cursor-pointer rounded-full bg-primary-container px-4 py-3.5 text-center font-label-lg text-sm font-bold text-on-primary shadow-md transition-all hover:bg-landing-primary active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-75"
				type="button"
				disabled={isProcessing}
				onclick={handleConfirmPayment}
			>
				{isProcessing
					? 'Memproses Transaksi...'
					: `Lanjutkan ke Pembayaran Aman (${formatRupiah(detail.price)})`}
			</button>

			<div
				class="mt-3 flex items-center justify-center gap-1 font-body-sm text-xs text-on-surface-variant"
			>
				<Lock class="size-3.5 text-primary" />
				<span>Terproteksi Enkripsi SSL 256-Bit</span>
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
