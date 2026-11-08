<script lang="ts">
	import { resolve } from '$app/paths';
	import LandingHeader from '../components/landing-header.svelte';
	import LandingFooterSection from '../components/landing-footer-section.svelte';
	import type { LevelPricingDetail } from '$features/landing-page/domain/landing-pricing-data';
	import type { CourseLevelItem } from '$features/course/domain/entities/course.entity';
	import type { AuthUser } from '$features/auth/domain/entities/auth.entity';
	import {
		ArrowLeft,
		CheckCircle2,
		Flame,
		Zap,
		BookOpen,
		Info,
		UserCheck,
		LockOpen,
		ShoppingCart,
		PlayCircle,
		ShieldCheck,
		Check,
		ChevronDown,
		X,
		Lock,
		CheckCircle,
		Infinity as InfinityIcon,
		HelpCircle
	} from 'lucide-svelte';

	interface Props {
		data: {
			user?: AuthUser | null;
			detail: LevelPricingDetail;
			levels?: CourseLevelItem[];
		};
	}

	let { data }: Props = $props();

	const user = $derived(data.user ?? null);
	const detail = $derived(data.detail);
	const displayName = $derived(user?.display_name ?? 'Pengguna');
	const avatarUrl = $derived(
		user?.avatar_url ??
			'https://gcwjewiszjevcgonvhld.supabase.co/storage/v1/object/public/public-avatars/gakkobit-default-ava.jpg'
	);

	const navSections = [
		{ id: 'beranda', label: 'Beranda' },
		{ id: 'kursus', label: 'Kursus' },
		{ id: 'kosakata', label: 'Kosakata' },
		{ id: 'ai-sensei', label: 'AI Sensei' },
		{ id: 'latihan', label: 'Latihan & Try Out' },
		{ id: 'harga', label: 'Paket & Harga' }
	];

	function scrollTo(id: string, e?: MouseEvent) {
		if (e) e.preventDefault();
		window.location.href = `/#${id}`;
	}

	function formatRupiah(value: number): string {
		if (value === 0) return 'Gratis';
		return 'Rp ' + new Intl.NumberFormat('id-ID').format(value);
	}

	// FAQ accordion state
	let openFaqIndex = $state<number | null>(0);

	function toggleFaq(index: number) {
		openFaqIndex = openFaqIndex === index ? null : index;
	}

	// Interactive Checkout Modal state
	let isModalOpen = $state(false);
	let selectedPayment = $state<'qris' | 'bca' | 'gopay' | 'card'>('qris');
	let isProcessing = $state(false);
	let paymentSuccess = $state(false);

	function openCheckout() {
		paymentSuccess = false;
		isProcessing = false;
		isModalOpen = true;
	}

	function closeCheckout() {
		if (!isProcessing) {
			isModalOpen = false;
		}
	}

	function handleConfirmPayment() {
		if (isProcessing) return;
		isProcessing = true;
		setTimeout(() => {
			isProcessing = false;
			paymentSuccess = true;
			setTimeout(() => {
				isModalOpen = false;
				paymentSuccess = false;
			}, 1800);
		}, 1000);
	}
</script>

<svelte:head>
	<title>{detail.heroTitle} - Gakkobit</title>
	<meta name="description" content={detail.heroSubtitle} />
</svelte:head>

<!-- HEADER -->
<LandingHeader
	{user}
	{displayName}
	{avatarUrl}
	activeSection="harga"
	{navSections}
	{scrollTo}
/>

<!-- MAIN WRAPPER -->
<main class="w-full min-h-[calc(100vh-20rem)] bg-surface pt-24 font-body-md text-on-surface antialiased">
	<div class="relative mx-auto max-w-7xl px-gutter-sm sm:px-gutter pb-space-xl">
		<!-- Breadcrumb & Back Navigation -->
		<div class="mb-4 flex items-center gap-2">
			<a
				href="/#harga"
				class="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3.5 py-1.5 text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container-high"
			>
				<ArrowLeft class="size-3.5" />
				Kembali ke Paket Belajar
			</a>
			<span class="text-xs text-muted-foreground">/</span>
			<span class="text-xs font-medium text-muted-foreground">{detail.name}</span>
		</div>

		<!-- Hero Overview Banner Section -->
		<section class="relative mb-space-lg overflow-hidden rounded-2xl bg-surface-container-low p-6 sm:p-8 lg:p-10 shadow-sm border border-outline-variant/20">
			<!-- Ambient Japanese aesthetic background accent -->
			<div class="pointer-events-none absolute -right-16 -top-16 size-80 rounded-full bg-secondary-container/20 blur-3xl"></div>
			<div class="pointer-events-none absolute -left-10 -bottom-10 size-72 rounded-full bg-tertiary-fixed/30 blur-2xl"></div>

			<div class="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
				<div class="max-w-3xl space-y-4">
					<!-- Badges & Pill Labels -->
					<div class="flex flex-wrap items-center gap-2">
						{#if detail.badge}
							<span class="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 font-label-sm text-xs font-semibold tracking-wide text-on-secondary shadow-xs">
								<Flame class="size-3.5" />
								{detail.badge}
							</span>
						{/if}
						<span class="inline-flex items-center gap-1 rounded-full bg-primary-container px-3 py-1 font-label-sm text-xs font-bold tracking-wider text-on-primary">
							{detail.levelTag}
						</span>
						<span class="inline-flex items-center gap-1 rounded-full bg-surface-container-highest px-2.5 py-1 font-label-sm text-xs text-on-surface-variant font-medium">
							<Zap class="size-3.5 text-primary" />
							{detail.standardTag}
						</span>
					</div>

					<!-- Main Title -->
					<h1 class="font-headline-lg lg:font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-on-surface leading-tight">
						{detail.heroTitle}
					</h1>

					<!-- Subtitle / Value Proposition -->
					<p class="font-body-lg text-sm sm:text-base text-on-surface-variant leading-relaxed">
						{detail.heroSubtitle}
					</p>

					<!-- Highlights & Badges -->
					<div class="flex flex-wrap items-center gap-y-2 gap-x-6 pt-2 text-xs sm:text-sm text-on-surface-variant font-medium">
						<div class="flex items-center gap-1.5">
							<InfinityIcon class="size-4 text-tertiary" />
							Akses Seumur Hidup
						</div>
						<div class="flex items-center gap-1.5">
							<ShieldCheck class="size-4 text-primary" />
							Garansi 7 Hari Uang Kembali
						</div>
						<div class="flex items-center gap-1.5">
							<CheckCircle class="size-4 text-primary" />
							100% Online &amp; Terstruktur
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Main Two-Column Layout -->
		<div class="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
			<!-- LEFT / MAIN CONTENT COLUMN (8 Cols on Desktop) -->
			<div class="space-y-8 lg:col-span-8">
				<!-- Kurikulum & Modul Section -->
				<section class="rounded-2xl bg-surface p-6 sm:p-8 shadow-sm border border-outline-variant/20">
					<div class="flex flex-col justify-between gap-2 pb-6 sm:flex-row sm:items-center">
						<div>
							<div class="flex items-center gap-2 font-label-md text-xs font-semibold tracking-wider text-primary uppercase">
								<BookOpen class="size-4" />
								Kurikulum Terstruktur
							</div>
							<h2 class="mt-1 font-headline-lg text-xl sm:text-2xl font-bold text-on-surface">
								Apa Saja yang Akan Anda Pelajari?
							</h2>
						</div>
						<span class="inline-flex items-center rounded-full bg-surface-container px-3 py-1 font-label-sm text-xs font-medium text-on-surface-variant">
							{detail.curriculumSubtitle}
						</span>
					</div>

					<!-- Modul Cards -->
					<div class="space-y-4">
						{#each detail.modules as module (module.number)}
							<div class="rounded-xl bg-surface-container-low p-5 transition-colors duration-200 hover:bg-surface-container">
								<div class="flex items-start gap-4">
									<div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-container font-bold text-on-primary shadow-xs">
										{module.number}
									</div>
									<div class="flex-1">
										<div class="flex flex-wrap items-center justify-between gap-2">
											<h3 class="font-headline-sm text-base font-bold text-on-surface">
												{module.title}
											</h3>
											<span class="rounded-full bg-surface-container-highest px-2.5 py-0.5 font-label-sm text-xs font-medium text-on-surface-variant">
												{module.duration}
											</span>
										</div>
										<p class="mt-2 font-body-md text-sm text-on-surface-variant leading-relaxed">
											{module.description}
										</p>

										{#if module.tags && module.tags.length > 0}
											<div class="mt-3.5 flex flex-wrap gap-2">
												{#each module.tags as tag}
													<span class="flex items-center gap-1 rounded-lg bg-surface px-2.5 py-1 font-label-sm text-xs text-on-surface-variant shadow-xs">
														<Check class="size-3.5 text-primary" /> {tag}
													</span>
												{/each}
											</div>
										{/if}

										{#if module.kanjiPreview}
											<div class="mt-3.5 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-surface p-3 shadow-xs">
												<div class="flex items-center gap-3">
													<span class="rounded bg-surface-container px-2.5 py-1 text-lg font-bold text-on-surface">
														{module.kanjiPreview.kanji}
													</span>
													<span class="text-xs text-on-surface-variant">
														{module.kanjiPreview.note}
													</span>
												</div>
											</div>
										{/if}

										{#if module.formulaPreview}
											<div class="mt-3.5 rounded-lg bg-surface-container p-3 font-mono text-xs text-on-surface shadow-xs">
												<div class="font-semibold text-primary">{module.formulaPreview.title}</div>
												<div class="mt-0.5 text-on-surface-variant">{module.formulaPreview.formula}</div>
											</div>
										{/if}
									</div>
								</div>
							</div>
						{/each}
					</div>
				</section>

				<!-- Prasyarat & Target Peserta -->
				<section class="rounded-2xl bg-surface p-6 sm:p-8 shadow-sm border border-outline-variant/20">
					<h2 class="mb-6 font-headline-lg text-xl sm:text-2xl font-bold text-on-surface">
						Prasyarat &amp; Target Peserta
					</h2>
					<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
						<div class="rounded-xl bg-surface-container-low p-5">
							<div class="mb-3 flex items-center gap-2">
								<Info class="size-5 text-primary" />
								<h3 class="font-headline-sm text-base font-bold text-on-surface">Prasyarat Belajar</h3>
							</div>
							<ul class="space-y-2.5 font-body-md text-sm text-on-surface-variant">
								{#each detail.prerequisites as item}
									<li class="flex items-start gap-2">
										<CheckCircle2 class="mt-0.5 size-4 shrink-0 text-primary" />
										<span>{item}</span>
									</li>
								{/each}
							</ul>
						</div>

						<div class="rounded-xl bg-surface-container-low p-5">
							<div class="mb-3 flex items-center gap-2">
								<UserCheck class="size-5 text-primary" />
								<h3 class="font-headline-sm text-base font-bold text-on-surface">Cocok Untuk Siapa?</h3>
							</div>
							<ul class="space-y-2.5 font-body-md text-sm text-on-surface-variant">
								{#each detail.targetAudience as item}
									<li class="flex items-start gap-2">
										<Check class="mt-0.5 size-4 shrink-0 text-secondary" />
										<span>{item}</span>
									</li>
								{/each}
							</ul>
						</div>
					</div>
				</section>

				<!-- FAQ Calon Pembeli -->
				<section class="rounded-2xl bg-surface p-6 sm:p-8 shadow-sm border border-outline-variant/20">
					<div class="mb-6">
						<span class="font-label-md text-xs font-semibold tracking-wider text-primary uppercase">
							Punya Pertanyaan?
						</span>
						<h2 class="mt-1 font-headline-lg text-xl sm:text-2xl font-bold text-on-surface">
							FAQ Calon Pembeli
						</h2>
					</div>
					<div class="space-y-3">
						{#each detail.faqs as faq, index}
							<div class="rounded-xl bg-surface-container-low p-4 transition-colors duration-200">
								<button
									class="flex w-full items-center justify-between text-left font-headline-sm text-sm sm:text-base font-semibold text-on-surface"
									type="button"
									onclick={() => toggleFaq(index)}
								>
									<span>{faq.question}</span>
									<ChevronDown
										class="size-5 text-on-surface-variant transition-transform duration-200 {openFaqIndex === index ? 'rotate-180' : ''}"
									/>
								</button>
								{#if openFaqIndex === index}
									<div class="mt-2.5 font-body-md text-sm text-on-surface-variant leading-relaxed">
										{faq.answer}
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</section>
			</div>

			<!-- RIGHT COLUMN: STICKY CHECKOUT & PURCHASE SUMMARY (4 Cols on Desktop) -->
			<aside class="sticky top-24 w-full space-y-6 lg:col-span-4">
				<div class="relative overflow-hidden rounded-2xl bg-surface p-6 sm:p-7 shadow-md border border-outline-variant/30">
					<!-- Card Header & Pricing -->
					<div class="pt-2">
						<span class="font-label-sm text-xs font-bold tracking-wider text-on-surface-variant uppercase">
							Investasi Belajar Sekali Seumur Hidup
						</span>
						<div class="mt-2.5 flex items-baseline gap-2">
							<span class="font-headline-lg text-3xl sm:text-4xl font-extrabold tracking-tight text-on-surface">
								{formatRupiah(detail.price)}
							</span>
						</div>
					</div>

					<!-- Payment Type Badge -->
					<div class="mt-4 flex items-center gap-2 rounded-xl bg-surface-container p-3 text-on-surface">
						<LockOpen class="size-4.5 text-primary shrink-0" />
						<span class="font-label-sm text-xs font-medium">
							Sekali Bayar • Bebas Akses Selamanya (Lifetime)
						</span>
					</div>

					<!-- CTAs -->
					<div class="mt-6 space-y-3">
						<button
							class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary-container px-6 py-3.5 font-label-lg text-sm font-bold text-on-primary shadow-md transition-all duration-200 hover:bg-landing-primary active:scale-[0.99]"
							type="button"
							onclick={openCheckout}
						>
							<ShoppingCart class="size-4.5" />
							Beli Paket {detail.code} Sekarang
						</button>

						<a
							class="flex w-full items-center justify-center gap-2 rounded-full bg-surface px-4 py-3 text-center font-label-md text-xs sm:text-sm font-semibold text-on-surface shadow-xs transition-colors duration-200 hover:bg-surface-container"
							href={user ? '/courses' : '/register'}
						>
							<PlayCircle class="size-4 text-on-surface-variant" />
							Coba Modul Pengenalan Gratis
						</a>
					</div>

					<!-- Guarantee Badge -->
					<div class="mt-5 flex items-center gap-3 rounded-xl bg-surface-container-low p-3">
						<div class="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
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
					<div class="mt-6 space-y-3 border-t border-outline-variant/30 pt-5">
						<div class="font-label-md text-xs font-bold text-on-surface">
							Paket Termasuk Semua Fitur Ini:
						</div>
						<ul class="space-y-2.5 font-body-sm text-xs sm:text-sm text-on-surface-variant">
							{#each detail.points as point}
								<li class="flex items-start gap-2">
									<CheckCircle2 class="mt-0.5 size-4 shrink-0 text-primary" />
									<span class="text-on-surface">{point}</span>
								</li>
							{/each}
						</ul>
					</div>
				</div>
			</aside>
		</div>
	</div>
</main>

<!-- FOOTER -->
<LandingFooterSection {scrollTo} />

<!-- CHECKOUT CONFIRMATION MODAL -->
{#if isModalOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 transition-opacity duration-300"
		role="dialog"
		aria-modal="true"
	>
		<!-- Backdrop click handler -->
		<button
			type="button"
			class="absolute inset-0 size-full cursor-default"
			aria-label="Tutup modal"
			onclick={closeCheckout}
		></button>

		<div class="relative w-full max-w-lg rounded-2xl bg-surface p-6 sm:p-8 shadow-2xl border border-outline-variant/40 animate-in fade-in zoom-in-95 duration-200">
			<!-- Close Button -->
			<button
				type="button"
				class="absolute top-5 right-5 flex size-8 items-center justify-center rounded-full bg-surface-container text-on-surface-variant transition-colors hover:text-on-surface"
				onclick={closeCheckout}
				aria-label="Tutup"
			>
				<X class="size-4.5" />
			</button>

			{#if paymentSuccess}
				<div class="py-8 text-center space-y-4">
					<div class="mx-auto flex size-14 items-center justify-center rounded-full bg-primary-container text-on-primary">
						<CheckCircle2 class="size-8" />
					</div>
					<h3 class="font-headline-md text-xl font-bold text-on-surface">
						Pembayaran Berhasil!
					</h3>
					<p class="font-body-md text-sm text-on-surface-variant max-w-sm mx-auto">
						Terima kasih! Simulasi proses pembayaran Paket {detail.name} berhasil. Akun Anda telah diaktifkan!
					</p>
				</div>
			{:else}
				<!-- Modal Content Header -->
				<div class="mb-6 text-left">
					<span class="rounded-full bg-secondary px-2.5 py-0.5 font-label-sm text-xs font-bold text-on-secondary uppercase">
						Konfirmasi Pembelian
					</span>
					<h3 class="mt-2 font-headline-md text-xl font-bold text-on-surface">
						Paket Belajar {detail.name} Lengkap
					</h3>
					<p class="font-body-sm text-xs text-on-surface-variant">
						Akses seumur hidup langsung aktif setelah pembayaran diverifikasi.
					</p>
				</div>

				<!-- Payment Summary Table -->
				<div class="mb-6 space-y-2 rounded-xl bg-surface-container p-4 font-body-md text-sm">
					<div class="flex justify-between text-on-surface-variant">
						<span>Harga Paket</span>
						<span class="font-medium text-on-surface">{formatRupiah(detail.price)}</span>
					</div>
					<div class="flex justify-between font-headline-sm text-base font-bold text-on-surface border-t border-outline-variant/20 pt-2">
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
						<label class="flex items-center gap-2 rounded-xl bg-surface-container-low p-3 cursor-pointer transition-colors hover:bg-surface-container {selectedPayment === 'qris' ? 'ring-2 ring-primary-container bg-surface-container' : ''}">
							<input
								type="radio"
								name="payment-method"
								value="qris"
								checked={selectedPayment === 'qris'}
								onchange={() => (selectedPayment = 'qris')}
								class="text-primary focus:ring-primary"
							/>
							<span class="font-semibold text-on-surface">QRIS Instant</span>
						</label>

						<label class="flex items-center gap-2 rounded-xl bg-surface-container-low p-3 cursor-pointer transition-colors hover:bg-surface-container {selectedPayment === 'bca' ? 'ring-2 ring-primary-container bg-surface-container' : ''}">
							<input
								type="radio"
								name="payment-method"
								value="bca"
								checked={selectedPayment === 'bca'}
								onchange={() => (selectedPayment = 'bca')}
								class="text-primary focus:ring-primary"
							/>
							<span class="font-semibold text-on-surface">BCA Virtual Account</span>
						</label>

						<label class="flex items-center gap-2 rounded-xl bg-surface-container-low p-3 cursor-pointer transition-colors hover:bg-surface-container {selectedPayment === 'gopay' ? 'ring-2 ring-primary-container bg-surface-container' : ''}">
							<input
								type="radio"
								name="payment-method"
								value="gopay"
								checked={selectedPayment === 'gopay'}
								onchange={() => (selectedPayment = 'gopay')}
								class="text-primary focus:ring-primary"
							/>
							<span class="font-semibold text-on-surface">GoPay / ShopeePay</span>
						</label>

						<label class="flex items-center gap-2 rounded-xl bg-surface-container-low p-3 cursor-pointer transition-colors hover:bg-surface-container {selectedPayment === 'card' ? 'ring-2 ring-primary-container bg-surface-container' : ''}">
							<input
								type="radio"
								name="payment-method"
								value="card"
								checked={selectedPayment === 'card'}
								onchange={() => (selectedPayment = 'card')}
								class="text-primary focus:ring-primary"
							/>
							<span class="font-semibold text-on-surface">Kartu Kredit</span>
						</label>
					</div>
				</div>

				<!-- Action Button -->
				<button
					class="w-full rounded-full bg-primary-container py-3.5 px-4 text-center font-label-lg text-sm font-bold text-on-primary shadow-md transition-all hover:bg-landing-primary disabled:opacity-75 disabled:cursor-not-allowed"
					type="button"
					disabled={isProcessing}
					onclick={handleConfirmPayment}
				>
					{isProcessing ? 'Memproses Transaksi...' : `Lanjutkan ke Pembayaran Aman (${formatRupiah(detail.price)})`}
				</button>

				<div class="mt-3 flex items-center justify-center gap-1 font-body-sm text-xs text-on-surface-variant">
					<Lock class="size-3.5 text-primary" /> Terproteksi Enkripsi SSL 256-Bit
				</div>
			{/if}
		</div>
	</div>
{/if}
