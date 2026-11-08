<script lang="ts">
	import PricingDetailView from '$features/landing-page/presentation/views/pricing-detail-view.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<PricingDetailView {data} />
