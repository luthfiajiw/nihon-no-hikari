<script lang="ts">
	import {
		PAYMENT_METHODS,
		VA_BANKS,
		MANUAL_ACCOUNTS,
		RETAIL_PARTNERS
	} from './landing-pricing-payment.config';
	import type {
		PaymentMethodId,
		VirtualAccountBank
	} from '../../domain/entities/landing-pricing-payment.entity';
	import {
		Landmark,
		QrCode,
		CreditCard,
		Banknote,
		Store,
		Wallet,
		ChevronDown,
		Info,
		Copy,
		Check,
		MapPin,
		ShieldCheck
	} from 'lucide-svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { viewportReveal } from '$lib/actions/viewport-reveal';

	interface Props {
		selectedMethod?: PaymentMethodId;
		selectedBank?: VirtualAccountBank;
	}

	let { selectedMethod = $bindable('va'), selectedBank = $bindable('BCA') }: Props = $props();

	let copiedAccount = $state<string | null>(null);

	async function copyAccountNumber(rawNumber: string) {
		try {
			await navigator.clipboard.writeText(rawNumber);
			copiedAccount = rawNumber;
			setTimeout(() => {
				if (copiedAccount === rawNumber) {
					copiedAccount = null;
				}
			}, 2000);
		} catch {
			// fallback if clipboard not permitted
		}
	}
</script>

<div class="flex flex-col gap-3.5">
	{#each PAYMENT_METHODS as method, index (method.id)}
		{@const isSelected = selectedMethod === method.id}
		<div
			class="overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-sm transition-all duration-200"
			use:viewportReveal={{ direction: 'up', delay: Math.min(index * 80, 400) }}
		>
			<!-- Method Header -->
			<button
				type="button"
				class="flex w-full cursor-pointer items-center justify-between p-4 text-left transition-colors hover:bg-surface-container-low sm:p-5"
				onclick={() => (selectedMethod = method.id)}
			>
				<div class="flex items-center gap-3.5">
					<!-- Radio indicator -->
					<div
						class="flex size-5 shrink-0 items-center justify-center rounded-full transition-colors {isSelected
							? 'bg-primary-container text-on-primary'
							: 'border-2 border-outline-variant'}"
					>
						{#if isSelected}
							<div class="size-2 rounded-full bg-surface-container-lowest"></div>
						{/if}
					</div>

					<!-- Method Icon Tile -->
					<div
						class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-container text-primary"
					>
						{#if method.id === 'va'}
							<Landmark class="size-5" />
						{:else if method.id === 'qris'}
							<QrCode class="size-5" />
						{:else if method.id === 'card'}
							<CreditCard class="size-5" />
						{:else if method.id === 'manual'}
							<Banknote class="size-5" />
						{:else if method.id === 'retail'}
							<Store class="size-5" />
						{:else}
							<Wallet class="size-5" />
						{/if}
					</div>

					<!-- Method Titles -->
					<div>
						<div class="flex flex-wrap items-center gap-2">
							<span class="font-headline-sm text-sm font-semibold text-on-surface sm:text-base">
								{method.title}
							</span>
							{#if method.badge}
								<Badge
									variant="default"
									class="rounded-full px-2 py-0.5 font-label-sm text-[11px] font-semibold {method
										.badge.tone === 'primary'
										? 'bg-primary-container text-on-primary'
										: 'bg-secondary text-on-secondary'}"
								>
									{method.badge.label}
								</Badge>
							{/if}
						</div>
						<p class="mt-0.5 font-body-sm text-xs text-on-surface-variant">
							{method.description}
						</p>
					</div>
				</div>

				<div class="flex items-center gap-2">
					{#if method.hint}
						<span class="hidden font-label-sm text-xs font-semibold text-secondary sm:inline-block">
							{method.hint}
						</span>
					{/if}
					<ChevronDown
						class="size-5 text-on-surface-variant transition-transform duration-200 {isSelected
							? 'rotate-180'
							: ''}"
					/>
				</div>
			</button>

			<!-- Method Body -->
			{#if isSelected}
				<div class="px-4 pt-1 pb-5 sm:px-5">
					{#if method.id === 'va'}
						<!-- Virtual Account Options -->
						<div class="flex flex-col gap-3 rounded-xl bg-surface-container-low p-4">
							<p class="font-label-md text-xs font-semibold text-on-surface sm:text-sm">
								Pilih Bank Penyedia Virtual Account:
							</p>
							<div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
								{#each VA_BANKS as bank (bank.code)}
									<label
										class="flex cursor-pointer items-center justify-between rounded-lg bg-surface-container-lowest p-3 shadow-sm transition-colors hover:bg-surface {selectedBank ===
										bank.code
											? 'ring-2 ring-primary-container'
											: 'border border-outline-variant/30'}"
									>
										<div class="flex items-center gap-2.5">
											<input
												type="radio"
												name="va_bank"
												value={bank.code}
												checked={selectedBank === bank.code}
												onchange={() => (selectedBank = bank.code)}
												class="size-4 accent-primary"
											/>
											<span class="font-label-md text-xs font-semibold text-on-surface sm:text-sm">
												{bank.name}
											</span>
										</div>
										<span
											class="rounded bg-surface-container px-2 py-0.5 font-label-sm font-mono text-xs text-on-surface-variant"
										>
											{bank.code}
										</span>
									</label>
								{/each}
							</div>
							<div class="mt-1 flex items-start gap-2 font-body-sm text-xs text-on-surface-variant">
								<Info class="mt-0.5 size-4 shrink-0 text-primary" />
								<span>
									Nomor Virtual Account unik akan di-generate otomatis setelah Anda menekan tombol
									bayar. Konfirmasi tanpa perlu upload bukti transfer.
								</span>
							</div>
						</div>
					{:else if method.id === 'qris'}
						<!-- QRIS & E-Wallet -->
						<div
							class="flex flex-col items-center gap-4 rounded-xl bg-surface-container-low p-4 sm:flex-row"
						>
							<div
								class="flex size-32 shrink-0 flex-col items-center justify-center rounded-xl bg-surface-container-lowest p-2 shadow-sm"
							>
								<QrCode class="size-20" />
							</div>
							c c
							<div class="flex flex-col gap-2">
								<p class="font-label-md text-xs font-semibold text-on-surface sm:text-sm">
									Panduan Cepat Scan QRIS:
								</p>
								<ol
									class="list-inside list-decimal space-y-1 font-body-sm text-xs text-on-surface-variant"
								>
									<li>Buka aplikasi m-Banking atau dompet digital (GoPay, OVO, Dana, dll).</li>
									<li>
										Pilih menu <span class="font-semibold text-on-surface">Scan QRIS</span>
										dan arahkan kamera ke barcode.
									</li>
									<li>
										Periksa nama merchant: <span class="font-semibold text-on-surface">
											PT Gakkobit Edukasi Nusantara
										</span>
										.
									</li>
									<li>
										Selesaikan pembayaran dan status akun langsung aktif dalam hitungan detik.
									</li>
								</ol>
							</div>
						</div>
					{:else if method.id === 'card'}
						<!-- Credit/Debit Card Fields -->
						<div class="flex flex-col gap-3 rounded-xl bg-surface-container-low p-4">
							<div class="flex flex-col gap-1.5">
								<Label class="font-label-sm text-xs font-semibold text-on-surface">
									Nomor Kartu
								</Label>
								<div class="relative">
									<Input
										type="text"
										maxlength={19}
										placeholder="4123 •••• •••• 2345"
										class="rounded-xl border-outline-variant/30 bg-surface-container-lowest pr-10 font-mono text-sm"
									/>
									<CreditCard class="absolute top-2.5 right-3 size-4.5 text-on-surface-variant" />
								</div>
							</div>
							<div class="grid grid-cols-2 gap-3">
								<div class="flex flex-col gap-1.5">
									<Label class="font-label-sm text-xs font-semibold text-on-surface">
										Masa Berlaku (MM/YY)
									</Label>
									<Input
										type="text"
										maxlength={5}
										placeholder="08/28"
										class="rounded-xl border-outline-variant/30 bg-surface-container-lowest font-mono text-sm"
									/>
								</div>
								<div class="flex flex-col gap-1.5">
									<div class="flex items-center justify-between">
										<Label class="font-label-sm text-xs font-semibold text-on-surface">
											CVV / CVC
										</Label>
										<span class="font-label-sm text-[10px] text-on-surface-variant">3 digit</span>
									</div>
									<Input
										type="password"
										maxlength={4}
										placeholder="•••"
										class="rounded-xl border-outline-variant/30 bg-surface-container-lowest font-mono text-sm"
									/>
								</div>
							</div>
							<div
								class="flex items-center gap-2 pt-1 font-label-sm text-xs text-on-surface-variant"
							>
								<ShieldCheck class="size-4 shrink-0 text-primary" />
								<span>
									Dilindungi oleh protokol verifikasi Visa Secure & Mastercard Identity Check
									256-bit.
								</span>
							</div>
						</div>
					{:else if method.id === 'manual'}
						<!-- Manual Bank Transfer -->
						<div class="flex flex-col gap-3 rounded-xl bg-surface-container-low p-4">
							{#each MANUAL_ACCOUNTS as acc (acc.bank)}
								<div
									class="flex items-center justify-between rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-3 shadow-sm"
								>
									<div>
										<div class="flex items-center gap-2">
											<span class="font-label-md text-xs font-bold text-on-surface sm:text-sm">
												{acc.bank}
											</span>
											<span class="font-label-sm text-xs text-on-surface-variant">
												{acc.holder}
											</span>
										</div>
										<span
											class="mt-1 block font-headline-sm font-mono text-base font-bold text-primary sm:text-lg"
										>
											{acc.accountNumber}
										</span>
									</div>
									<button
										type="button"
										class="flex cursor-pointer items-center gap-1 rounded-lg border border-outline-variant/30 bg-surface-container px-3 py-1.5 font-label-sm text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container-high"
										onclick={() => copyAccountNumber(acc.rawNumber)}
									>
										{#if copiedAccount === acc.rawNumber}
											<Check class="size-3.5 text-primary" />
											<span class="font-bold text-primary">Tersalin!</span>
										{:else}
											<Copy class="size-3.5" />
											<span>Salin</span>
										{/if}
									</button>
								</div>
							{/each}
							<p class="font-body-sm text-xs text-on-surface-variant">
								Kirim bukti transfer ke WhatsApp admin bantuan setelah transaksi selesai untuk
								verifikasi kilat.
							</p>
						</div>
					{:else if method.id === 'retail'}
						<!-- Retail Partners -->
						<div class="flex flex-col gap-3 rounded-xl bg-surface-container-low p-4">
							<p class="font-body-sm text-xs text-on-surface-variant">
								Tunjukkan kode bayar kasir yang terbit ke kasir gerai terdekat. Pembayaran dapat
								menggunakan tunai maupun non-tunai di kasir.
							</p>
							<div class="flex flex-wrap gap-2">
								{#each RETAIL_PARTNERS as partner (partner)}
									<span
										class="rounded-md border border-outline-variant/30 bg-surface-container-lowest px-3 py-1 font-label-sm text-xs font-semibold text-on-surface shadow-sm"
									>
										{partner}
									</span>
								{/each}
							</div>
						</div>
					{:else if method.id === 'cash'}
						<!-- Cash / Office -->
						<div class="flex flex-col gap-2 rounded-xl bg-surface-container-low p-4">
							<p class="font-body-sm text-xs text-on-surface">
								Simpan ID Pesanan Anda dan lakukan pembayaran langsung di loket kasir mitra kami
								dalam 1x24 jam sebelum slot promo kedaluwarsa.
							</p>
							<div class="flex items-center gap-2 font-label-sm text-xs text-on-surface-variant">
								<MapPin class="size-4.5 shrink-0 text-primary" />
								<span>Ganbare Learning Hub: Gandaria City Office 8th Fl, Jakarta Selatan.</span>
							</div>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	{/each}
</div>
