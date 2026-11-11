<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import LandingHeader from '../components/landing-header.svelte';
	import LandingFooterSection from '../components/landing-footer-section.svelte';
	import LandingPricingDetailHeroSection from '../components/landing-pricing-detail-hero-section.svelte';
	import LandingPricingDetailCurriculumSection from '../components/landing-pricing-detail-curriculum-section.svelte';
	import LandingPricingDetailPrerequisitesSection from '../components/landing-pricing-detail-prerequisites-section.svelte';
	import LandingPricingDetailFaqSection from '../components/landing-pricing-detail-faq-section.svelte';
	import LandingPricingDetailSidebar from '../components/landing-pricing-detail-sidebar.svelte';
	import type { PricingDetail } from '$features/landing-page/domain/entities/landing-pricing.entity';
	import type { AuthUser } from '$features/auth/domain/entities/auth.entity';
	import { getLandingPricingPaymentContext } from '../contexts/landing-pricing-payment-context';

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

	const paymentContext = getLandingPricingPaymentContext();
	let isNavigating = $state(false);

	async function handleBuyPackage(): Promise<void> {
		if (isNavigating) return;
		isNavigating = true;

		try {
			const code = detail.code.toLowerCase();
			paymentContext.setPackage(detail);
			await goto(resolve('/pricing/[code]/payment', { code }));
		} catch (error) {
			console.error('Gagal berpindah ke halaman pembayaran:', error);
			isNavigating = false;
		}
	}

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
		<!-- Hero Overview Banner Section -->
		<LandingPricingDetailHeroSection {detail} />

		<!-- Main Two-Column Layout -->
		<div class="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
			<!-- LEFT / MAIN CONTENT COLUMN (8 Cols on Desktop) -->
			<div class="space-y-8 lg:col-span-8">
				<LandingPricingDetailCurriculumSection {detail} />
				<LandingPricingDetailPrerequisitesSection />
				<LandingPricingDetailFaqSection />
			</div>

			<!-- RIGHT COLUMN: STICKY CHECKOUT & PURCHASE SUMMARY (4 Cols on Desktop) -->
			<LandingPricingDetailSidebar
				{detail}
				{user}
				{isNavigating}
				onBuyPackage={handleBuyPackage}
			/>
		</div>
	</div>
</main>

<!-- FOOTER -->
<LandingFooterSection {scrollTo} />
