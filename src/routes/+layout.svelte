<script lang="ts">
	// import type { Pathname } from '$app/types';
	// import { resolve } from '$app/paths';
	// import { locales, localizeHref } from '$lib/paraglide/runtime';
	import { browser } from '$app/environment';
	import { navigating, page } from '$app/state';
	import type { PricingDetail } from '$features/landing-page/domain/entities/landing-pricing.entity';
	import {
		setLandingPricingPaymentContext,
		type LandingPricingPaymentSelection
	} from '$features/landing-page/presentation/contexts/landing-pricing-payment-context';
	import './layout.css';
	import favicon from '$lib/assets/favicon.ico';
	import '@fontsource-variable/inter';
	import '@fontsource-variable/noto-sans-jp';
	import '@fontsource/kaisei-tokumin';

	let { children } = $props();

	const storageKeyPrefix = 'pricing-payment-selection:';
	const pricingPaymentSelection = $state<LandingPricingPaymentSelection>({
		selectedPackage: null
	});

	function getStorageKey(code: string): string {
		return `${storageKeyPrefix}${code.toLowerCase()}`;
	}

	function clearPricingPaymentSelection(): void {
		pricingPaymentSelection.selectedPackage = null;
	}

	function restorePricingPaymentSelection(code: string): void {
		const normalizedCode = code.toLowerCase();
		if (pricingPaymentSelection.selectedPackage?.code.toLowerCase() === normalizedCode) {
			return;
		}

		try {
			const serializedSelection = sessionStorage.getItem(getStorageKey(normalizedCode));
			if (!serializedSelection) {
				clearPricingPaymentSelection();
				return;
			}

			const storedPackage = JSON.parse(serializedSelection) as Partial<PricingDetail>;
			if (!storedPackage || storedPackage.code?.toLowerCase() !== normalizedCode) {
				sessionStorage.removeItem(getStorageKey(normalizedCode));
				clearPricingPaymentSelection();
				return;
			}

			pricingPaymentSelection.selectedPackage = storedPackage as PricingDetail;
		} catch {
			clearPricingPaymentSelection();
		}
	}

	function persistPricingPaymentSelection(detail: PricingDetail | null): void {
		if (!browser) return;

		try {
			if (detail) {
				sessionStorage.setItem(getStorageKey(detail.code), JSON.stringify(detail));
			} else if (page.params.code) {
				sessionStorage.removeItem(getStorageKey(page.params.code));
			}
		} catch {
			// Context remains usable when storage is unavailable or full.
		}
	}

	if (browser && page.params.code) {
		restorePricingPaymentSelection(page.params.code);
	}

	$effect(() => {
		const routeId = page.route.id;
		const code = routeId?.startsWith('/pricing/[code]') ? page.params.code : null;
		if (browser && code) {
			restorePricingPaymentSelection(code);
		}
	});

	setLandingPricingPaymentContext({
		get selectedPackage() {
			return pricingPaymentSelection.selectedPackage;
		},
		setPackage(detail: PricingDetail) {
			pricingPaymentSelection.selectedPackage = detail;
			persistPricingPaymentSelection(detail);
		},
		clearPackage() {
			clearPricingPaymentSelection();
			persistPricingPaymentSelection(null);
		}
	});
</script>

<svelte:head>
	<link rel="icon" type="image/x-icon" href={favicon} />
</svelte:head>

{#if navigating.to}
	<div
		class="absolute inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-primary/15"
		role="progressbar"
		aria-label="Memuat halaman"
	>
		<div class="route-progress-indicator h-full bg-primary"></div>
	</div>
{/if}
{@render children?.()}

<!-- <div style="display:none">
	{#each locales as locale (locale)}
		<a
			href={resolve(localizeHref(page.url.pathname, { locale }) as Pathname)}
		>{locale}</a>
	{/each}
</div> -->
