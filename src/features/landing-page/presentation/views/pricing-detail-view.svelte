<script lang="ts">
	import LandingHeader from '../components/landing-header.svelte';
	import LandingFooterSection from '../components/landing-footer-section.svelte';
	import * as Accordion from '$lib/components/ui/accordion';
	import type { PricingDetail } from '$features/landing-page/domain/entities/landing-pricing.entity';
	import type { AuthUser } from '$features/auth/domain/entities/auth.entity';
	import {
		ArrowLeft,
		CheckCircle2,
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
		ChevronRight,
		Clock,
		X,
		Lock,
		CheckCircle,
		Infinity as InfinityIcon
	} from 'lucide-svelte';

	interface Props {
		data: {
			user?: AuthUser | null;
			detail: PricingDetail;
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

	function formatDuration(estimatedMinutes: number): string {
		if (!estimatedMinutes || estimatedMinutes <= 0) return 'Pelajaran Mandiri';
		if (estimatedMinutes >= 60) {
			const hours = Math.round(estimatedMinutes / 60);
			return `${hours} Jam Belajar`;
		}
		return `${estimatedMinutes} Menit`;
	}

	const totalEstimatedMinutes = $derived(
		detail.modules ? detail.modules.reduce((acc, m) => acc + (m.estimated_minutes || 0), 0) : 0
	);

	const totalDurationLabel = $derived(
		totalEstimatedMinutes > 0
			? `${Math.round(totalEstimatedMinutes / 60)} Jam Belajar`
			: '12 Jam Belajar'
	);

	const INITIAL_MODULE_LIMIT = 4;
	let showAllModules = $state(false);
	const visibleModules = $derived(
		showAllModules ? (detail.modules ?? []) : (detail.modules ?? []).slice(0, INITIAL_MODULE_LIMIT)
	);
	const hasMoreModules = $derived((detail.modules?.length ?? 0) > INITIAL_MODULE_LIMIT);

	let openModuleIds = $state<string[]>([]);
	let isInitialAccordionSet = false;
	$effect(() => {
		if (!isInitialAccordionSet && detail.modules && detail.modules.length > 0) {
			openModuleIds = [detail.modules[0].id];
			isInitialAccordionSet = true;
		}
	});

	function formatLessonTitle(moduleIndex: number, lessonIndex: number, title: string): string {
		const trimmed = title.trim();
		if (/^\d+(\.\d+)*\s+/.test(trimmed)) {
			return trimmed;
		}
		return `${moduleIndex}.${lessonIndex} ${trimmed}`;
	}

	const prerequisites = [
		'Perangkat smartphone Android/iOS atau laptop dengan koneksi internet aktif.',
		'Komitmen belajar santai 15–30 menit setiap hari untuk hasil optimal.',
		'Dapat belajar mandiri kapan saja sesuai dengan waktu luang Anda.'
	];

	const targetAudience = [
		'Pelajar & Mahasiswa yang merencanakan studi lanjut / program pertukaran ke Jepang.',
		'Pencari kerja untuk program Tokutei Ginou (SSW) atau Magang Kerja (Kenshusei).',
		'Pecinta bahasa, budaya Jepang, anime, dan manga yang ingin memahami bahasa Jepang nyata.'
	];

	const faqs = [
		{
			question: 'Apakah akses berlaku selamanya (lifetime)?',
			answer:
				'Ya! Sekali bayar, Anda berhak mengakses seluruh materi Paket selamanya. Tidak ada biaya langganan bulanan, dan Anda otomatis menerima seluruh pembaruan materi ujian di masa depan tanpa biaya tambahan.'
		},
		{
			question: 'Bisakah platform ini diakses melalui smartphone?',
			answer:
				'Tentu saja. Platform sepenuhnya responsif untuk smartphone (Android & iOS), tablet, dan laptop. Seluruh progress tersinkronisasi otomatis antar-perangkat secara real-time.'
		},
		{
			question: 'Bagaimana jika saya memerlukan bimbingan saat belajar?',
			answer:
				'Tersedia fitur AI Sensei Tutor 24/7 yang siap menjawab pertanyaan Anda mengenai tata bahasa, kosakata, kanji, dan cara penggunaannya kapan saja.'
		},
		{
			question: 'Bagaimana cara klaim garansi 7 hari uang kembali?',
			answer:
				'Jika Anda merasa metode kami tidak cocok dalam 7 hari pertama sejak pembelian, cukup hubungi tim support kami melalui WhatsApp atau email. Dana akan kami kembalikan 100% tanpa pertanyaan berbelit-belit.'
		}
	];

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
	<title>{detail.name} - Gakkobit</title>
	{#if detail.description}
		<meta name="description" content={detail.description} />
	{/if}
</svelte:head>

<!-- HEADER -->
<LandingHeader {user} {displayName} {avatarUrl} activeSection="harga" {navSections} {scrollTo} />

<!-- MAIN WRAPPER -->
<main
	class="min-h-[calc(100vh-20rem)] w-full bg-surface pt-24 font-body-md text-on-surface antialiased"
>
	<div class="relative mx-auto max-w-7xl px-gutter-sm pb-space-xl sm:px-gutter">
		<!-- Breadcrumb & Back Navigation -->
		<div class="mb-4 flex items-center gap-2">
			<a
				href="/#harga"
				class="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3.5 py-1.5 text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container-high"
			>
				<ArrowLeft class="size-3.5" />
				Kembali
			</a>
		</div>

		<!-- Hero Overview Banner Section -->
		<section
			class="relative mb-space-lg overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-low p-6 shadow-sm sm:p-8 lg:p-10"
		>
			<!-- Ambient Japanese aesthetic background accent -->
			<div
				class="pointer-events-none absolute -top-16 -right-16 size-80 rounded-full bg-secondary-container/20 blur-3xl"
			></div>
			<div
				class="pointer-events-none absolute -bottom-10 -left-10 size-72 rounded-full bg-tertiary-fixed/30 blur-2xl"
			></div>

			<div class="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
				<div class="max-w-3xl space-y-4">
					<!-- Pill Labels -->
					<div class="flex flex-wrap items-center gap-2">
						<span
							class="inline-flex items-center gap-1 rounded-full bg-surface-container-highest px-2.5 py-1 font-label-sm text-xs font-medium text-on-surface-variant"
						>
							<Zap class="size-3.5 text-primary" />
							Kurikulum Standar JF 2025
						</span>
					</div>

					<!-- Main Title -->
					<h1
						class="font-headline-lg text-2xl leading-tight font-extrabold tracking-tight text-on-surface sm:text-3xl lg:font-display lg:text-4xl"
					>
						{detail.name}
					</h1>

					<!-- Subtitle / Description -->
					{#if detail.description}
						<p class="font-body-lg text-sm leading-relaxed text-on-surface-variant sm:text-base">
							{detail.description}
						</p>
					{/if}

					<!-- Highlights & Badges -->
					<div
						class="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs font-medium text-on-surface-variant sm:text-sm"
					>
						<div class="flex items-center gap-1.5">
							<InfinityIcon class="size-4 text-tertiary" />
							Akses Seumur Hidup
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
				<!-- Kurikulum Terstruktur Header Card -->
				<section
					class="relative overflow-hidden rounded-3xl border border-outline-variant/30 bg-surface-container-low p-6 shadow-xs sm:p-8"
				>
					<div class="flex flex-col justify-between gap-6 md:flex-row md:items-center">
						<div class="max-w-xl space-y-2">
							<div
								class="flex items-center gap-2 font-label-md text-xs font-semibold tracking-wider text-on-surface-variant uppercase"
							>
								<BookOpen class="size-4 text-primary" />
								Kurikulum Terstruktur
							</div>
							<h2
								class="font-headline-lg text-2xl font-extrabold tracking-tight text-on-surface sm:text-3xl lg:text-4xl"
							>
								Apa Saja yang Akan Anda Pelajari?
							</h2>
							<p class="font-body-md text-sm leading-relaxed text-on-surface-variant sm:text-base">
								Panduan komprehensif dari nol mutlak hingga fasih membaca, menulis, dan lulus ujian
								JLPT {detail.code} dengan metode bertahap dan teruji.
							</p>
						</div>

						<div class="shrink-0 self-start md:self-center">
							<span
								class="inline-flex items-center rounded-full border border-outline-variant/30 bg-surface-container px-4 py-2 font-label-sm text-xs font-semibold text-on-surface-variant shadow-2xs"
							>
								{detail.total_modules} Modul Utama • {detail.total_lessons} Pelajaran Mandiri • {totalDurationLabel}
							</span>
						</div>
					</div>
				</section>

				<!-- Modul Accordion List -->
				<section class="space-y-4">
					{#if detail.modules && detail.modules.length > 0}
						<Accordion.Root
							type="multiple"
							bind:value={openModuleIds}
							class="space-y-4"
						>
							{#each visibleModules as module, index (module.id)}
								{@const duration = formatDuration(module.estimated_minutes)}
								<Accordion.Item
									value={module.id}
									class="overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-xs transition-colors hover:border-outline-variant/50"
								>
									<Accordion.Trigger
										class="cursor-pointer px-5 py-4 text-left transition-colors hover:bg-surface-container-low/40 hover:no-underline sm:px-6 sm:py-5"
									>
										<div class="flex items-center gap-4">
											<div
												class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface-container-highest font-bold text-on-surface shadow-2xs"
											>
												{String(index + 1).padStart(2, '0')}
											</div>
											<div class="space-y-1">
												<span class="block font-headline-sm text-base font-bold text-on-surface sm:text-lg">
													{module.title}
												</span>
												<div
													class="flex flex-wrap items-center gap-2 text-xs font-medium text-on-surface-variant"
												>
													<span class="inline-flex items-center gap-1">
														<BookOpen class="size-3.5 text-primary" />
														{module.lesson_count} Pelajaran
													</span>
													<span>•</span>
													<span class="inline-flex items-center gap-1">
														<Clock class="size-3.5 text-primary" />
														{duration}
													</span>
												</div>
											</div>
										</div>
									</Accordion.Trigger>

									<Accordion.Content class="px-5 pt-0 pb-5 sm:px-6 sm:pb-6">
										{#if module.description}
											<div class="py-3">
												<div
													class="rounded-xl bg-surface-container-low p-4 font-body-md text-sm leading-relaxed text-on-surface-variant"
												>
													{module.description}
												</div>
											</div>
										{/if}

										{#if module.lessons && module.lessons.length > 0}
											<div class="space-y-2.5">
												{#each module.lessons as lesson, lessonIdx (lesson.id)}
													{@const lessonTitle = formatLessonTitle(
														index + 1,
														lessonIdx + 1,
														lesson.title
													)}
													<div
														class="flex items-center justify-between rounded-xl border border-outline-variant/25 bg-surface-container-lowest px-4 py-3.5 shadow-2xs"
													>
														<span class="font-body-md text-sm font-semibold text-on-surface">
															{lessonTitle}
														</span>
													</div>
												{/each}
											</div>
										{:else}
											<div
												class="rounded-xl border border-dashed border-outline-variant/40 p-4 text-center text-xs text-on-surface-variant"
											>
												Belum ada pelajaran yang dipublikasikan di modul ini.
											</div>
										{/if}
									</Accordion.Content>
								</Accordion.Item>
							{/each}
						</Accordion.Root>

						{#if hasMoreModules && !showAllModules}
							<button
								type="button"
								class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest py-3.5 font-label-md text-sm font-semibold text-on-surface shadow-xs transition-colors hover:bg-surface-container"
								onclick={() => (showAllModules = true)}
							>
								<span>
									Muat Lebih Banyak Modul ({detail.modules.length - INITIAL_MODULE_LIMIT} lainnya)
								</span>
								<ChevronDown class="size-4 text-on-surface-variant" />
							</button>
						{/if}
					{:else}
						<div
							class="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-8 text-center text-sm text-on-surface-variant shadow-xs"
						>
							Belum ada modul yang diterbitkan untuk level ini.
						</div>
					{/if}
				</section>

				<!-- Prasyarat & Target Peserta -->
				<section
					class="rounded-2xl border border-outline-variant/20 bg-surface p-6 shadow-sm sm:p-8"
				>
					<h2 class="mb-6 font-headline-lg text-xl font-bold text-on-surface sm:text-2xl">
						Prasyarat &amp; Target Peserta
					</h2>
					<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
						<div class="rounded-xl bg-surface-container-low p-5">
							<div class="mb-3 flex items-center gap-2">
								<Info class="size-5 text-primary" />
								<h3 class="font-headline-sm text-base font-bold text-on-surface">
									Prasyarat Belajar
								</h3>
							</div>
							<ul class="space-y-2.5 font-body-md text-sm text-on-surface-variant">
								{#each prerequisites as item}
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
								<h3 class="font-headline-sm text-base font-bold text-on-surface">
									Cocok Untuk Siapa?
								</h3>
							</div>
							<ul class="space-y-2.5 font-body-md text-sm text-on-surface-variant">
								{#each targetAudience as item}
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
				<section
					class="rounded-2xl border border-outline-variant/20 bg-surface p-6 shadow-sm sm:p-8"
				>
					<div class="mb-6">
						<span class="font-label-md text-xs font-semibold tracking-wider text-primary uppercase">
							Punya Pertanyaan?
						</span>
						<h2 class="mt-1 font-headline-lg text-xl font-bold text-on-surface sm:text-2xl">
							FAQ Calon Pembeli
						</h2>
					</div>
					<div class="space-y-3">
						{#each faqs as faq, index}
							<div class="rounded-xl bg-surface-container-low p-4 transition-colors duration-200">
								<button
									class="flex w-full items-center justify-between text-left font-headline-sm text-sm font-semibold text-on-surface sm:text-base"
									type="button"
									onclick={() => toggleFaq(index)}
								>
									<span>{faq.question}</span>
									<ChevronDown
										class="size-5 text-on-surface-variant transition-transform duration-200 {openFaqIndex ===
										index
											? 'rotate-180'
											: ''}"
									/>
								</button>
								{#if openFaqIndex === index}
									<div class="mt-2.5 font-body-md text-sm leading-relaxed text-on-surface-variant">
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
				<div
					class="relative overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface p-6 shadow-md sm:p-7"
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
					<div
						class="mt-4 flex items-center gap-2 rounded-xl bg-surface-container p-3 text-on-surface"
					>
						<LockOpen class="size-4.5 shrink-0 text-primary" />
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
							class="flex w-full items-center justify-center gap-2 rounded-full bg-surface px-4 py-3 text-center font-label-md text-xs font-semibold text-on-surface shadow-xs transition-colors duration-200 hover:bg-surface-container sm:text-sm"
							href={user ? '/courses' : '/register'}
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
								{#each detail.points as point}
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
		</div>
	</div>
</main>

<!-- FOOTER -->
<LandingFooterSection {scrollTo} />

<!-- CHECKOUT CONFIRMATION MODAL -->
{#if isModalOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs transition-opacity duration-300"
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

		<div
			class="animate-in fade-in zoom-in-95 relative w-full max-w-lg rounded-2xl border border-outline-variant/40 bg-surface p-6 shadow-2xl duration-200 sm:p-8"
		>
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
				<div class="space-y-4 py-8 text-center">
					<div
						class="mx-auto flex size-14 items-center justify-center rounded-full bg-primary-container text-on-primary"
					>
						<CheckCircle2 class="size-8" />
					</div>
					<h3 class="font-headline-md text-xl font-bold text-on-surface">Pembayaran Berhasil!</h3>
					<p class="mx-auto max-w-sm font-body-md text-sm text-on-surface-variant">
						Terima kasih! Simulasi proses pembayaran Paket {detail.name} berhasil. Akun Anda telah diaktifkan!
					</p>
				</div>
			{:else}
				<!-- Modal Content Header -->
				<div class="mb-6 text-left">
					<span
						class="rounded-full bg-secondary px-2.5 py-0.5 font-label-sm text-xs font-bold text-on-secondary uppercase"
					>
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
						<label
							class="flex cursor-pointer items-center gap-2 rounded-xl bg-surface-container-low p-3 transition-colors hover:bg-surface-container {selectedPayment ===
							'qris'
								? 'bg-surface-container ring-2 ring-primary-container'
								: ''}"
						>
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

						<label
							class="flex cursor-pointer items-center gap-2 rounded-xl bg-surface-container-low p-3 transition-colors hover:bg-surface-container {selectedPayment ===
							'bca'
								? 'bg-surface-container ring-2 ring-primary-container'
								: ''}"
						>
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

						<label
							class="flex cursor-pointer items-center gap-2 rounded-xl bg-surface-container-low p-3 transition-colors hover:bg-surface-container {selectedPayment ===
							'gopay'
								? 'bg-surface-container ring-2 ring-primary-container'
								: ''}"
						>
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

						<label
							class="flex cursor-pointer items-center gap-2 rounded-xl bg-surface-container-low p-3 transition-colors hover:bg-surface-container {selectedPayment ===
							'card'
								? 'bg-surface-container ring-2 ring-primary-container'
								: ''}"
						>
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
					class="w-full rounded-full bg-primary-container px-4 py-3.5 text-center font-label-lg text-sm font-bold text-on-primary shadow-md transition-all hover:bg-landing-primary disabled:cursor-not-allowed disabled:opacity-75"
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
					<Lock class="size-3.5 text-primary" /> Terproteksi Enkripsi SSL 256-Bit
				</div>
			{/if}
		</div>
	</div>
{/if}
