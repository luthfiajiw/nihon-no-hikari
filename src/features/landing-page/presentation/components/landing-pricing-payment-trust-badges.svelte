<script lang="ts">
	import { viewportReveal } from '$lib/actions/viewport-reveal';
	import { TRUST_BADGES } from './landing-pricing-payment.config';
	import { ShieldCheck, Infinity as InfinityIcon, Bot } from 'lucide-svelte';
</script>

<div class="grid grid-cols-1 gap-3 md:grid-cols-3">
	{#each TRUST_BADGES as badge, index (badge.title)}
		<div
			class="flex items-start gap-3 rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-4 shadow-sm"
			use:viewportReveal={{ direction: 'up', delay: Math.min(index * 80, 400) }}
		>
			<div
				class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-container text-primary"
			>
				{#if badge.icon === 'verified'}
					<ShieldCheck class="size-4.5" />
				{:else if badge.icon === 'lifetime'}
					<InfinityIcon class="size-4.5" />
				{:else}
					<Bot class="size-4.5" />
				{/if}
			</div>
			<div>
				<p class="font-label-md text-sm font-semibold text-on-surface">{badge.title}</p>
				<p class="font-body-sm text-xs text-on-surface-variant">{badge.description}</p>
			</div>
		</div>
	{/each}
</div>
