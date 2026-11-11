<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import LandingHeader from '../components/landing-header.svelte';
	import LandingFooterSection from '../components/landing-footer-section.svelte';
	import LandingPricingPaymentMethodList from '../components/landing-pricing-payment-method-list.svelte';
	import LandingPricingPaymentSummary from '../components/landing-pricing-payment-summary.svelte';
	import LandingPricingPaymentTrustBadges from '../components/landing-pricing-payment-trust-badges.svelte';
	import LandingPricingPaymentSuccess from '../components/landing-pricing-payment-success.svelte';
	import type {
		PaymentMethodId,
		VirtualAccountBank
	} from '../../domain/entities/landing-pricing-payment.entity';
	import { getPricingPaymentSummaryUseCase } from '$dependencies/landing-page.dependency';
	import type { AuthUser } from '$features/auth/domain/entities/auth.entity';
	import { ArrowLeft } from 'lucide-svelte';
	import { viewportReveal } from '$lib/actions/viewport-reveal';
	import { getLandingPricingPaymentContext } from '../contexts/landing-pricing-payment-context';

	interface Props {
		data: {
			user?: AuthUser | null;
			code: string;
		};
	}

	let { data }: Props = $props();

	const paymentContext = getLandingPricingPaymentContext();
	const user = $derived(data.user ?? null);
	const normalizedCode = $derived(data.code.toLowerCase());
	const detail = $derived(paymentContext.selectedPackage);

	const displayName = $derived(user?.display_name ?? 'Pengguna');
	const avatarUrl = $derived(
		user?.avatar_url ??
			'https://gcwjewiszjevcgonvhld.supabase.co/storage/v1/object/public/public-avatars/gakkobit-default-ava.jpg'
	);

	const summary = $derived(detail ? getPricingPaymentSummaryUseCase.exec(detail.price) : null);

	let selectedMethod = $state<PaymentMethodId>('va');
	let selectedBank = $state<VirtualAccountBank>('BCA');
	let isProcessing = $state(false);
	let paymentSuccess = $state(false);

	// If no package in context/sessionStorage, redirect back to pricing detail
	$effect(() => {
		if (typeof window !== 'undefined' && !paymentContext.selectedPackage) {
			goto(resolve('/pricing/[code]', { code: normalizedCode }));
		}
	});

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

	function handlePay() {
		if (isProcessing) return;
		isProcessing = true;

		setTimeout(() => {
			isProcessing = false;
			paymentSuccess = true;
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}, 1200);
	}
</script>

<svelte:head>
	<title>{detail ? `Pembayaran ${detail.name} - Gakkobit` : 'Pembayaran Paket - Gakkobit'}</title>
	<meta
		name="description"
		content={detail
			? `Selesaikan pembayaran paket belajar ${detail.name} di Gakkobit. Nikmati akses seumur hidup materi video dan AI Sensei.`
			: 'Selesaikan pembayaran paket belajar di Gakkobit.'}
	/>
</svelte:head>

<!-- HEADER -->
<LandingHeader {user} {displayName} {avatarUrl} activeSection="harga" {navSections} {scrollTo} />

<!-- MAIN WRAPPER -->
<main
	class="min-h-[calc(100vh-20rem)] w-full bg-surface pt-24 font-body-md text-on-surface antialiased"
>
	<div class="relative mx-auto max-w-7xl px-gutter-sm pb-space-xl sm:px-gutter">
		{#if !detail || !summary}
			<!-- Loading/Redirecting fallback state -->
			<div class="flex min-h-[50vh] flex-col items-center justify-center gap-3">
				<div
					class="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
				></div>
				<p class="font-body-sm text-sm text-on-surface-variant">Memuat ringkasan paket...</p>
			</div>
		{:else if paymentSuccess}
			<div class="py-12">
				<LandingPricingPaymentSuccess {detail} />
			</div>
		{:else}
			<!-- Top Context & Back Navigation -->
			<a
				href={resolve('/pricing/[code]', { code: normalizedCode })}
				use:viewportReveal={{ direction: 'up' }}
				class="mb-4 inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3.5 py-1.5 text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container-high"
			>
				<ArrowLeft class="size-3.5" />
				Kembali
			</a>

			<!-- Title Section -->
			<div class="mb-6" use:viewportReveal={{ direction: 'up', delay: 100 }}>
				<h1 class="font-headline-lg text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
					Detail & Metode Pembayaran
				</h1>
			</div>

			<!-- Main Grid Layout (7 cols methods, 5 cols summary) -->
			<div class="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
				<!-- Left Column: Payment Methods & Trust Badges -->
				<div class="flex flex-col gap-6 lg:col-span-7">
					<LandingPricingPaymentMethodList bind:selectedMethod bind:selectedBank />
					<LandingPricingPaymentTrustBadges />
				</div>

				<!-- Right Column: Sticky Order Summary & Price Breakdown -->
				<LandingPricingPaymentSummary {detail} {summary} {isProcessing} onPay={handlePay} />
			</div>
		{/if}
	</div>
</main>

<!-- FOOTER -->
<LandingFooterSection {scrollTo} />
