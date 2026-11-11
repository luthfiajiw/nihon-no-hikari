<script lang="ts">
	import PricingPaymentView from '$features/landing-page/presentation/views/pricing-payment-view.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<PricingPaymentView {data} />
