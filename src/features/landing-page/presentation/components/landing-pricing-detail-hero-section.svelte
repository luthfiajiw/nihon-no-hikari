<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ResolvedPathname } from '$app/types';
	import type { PricingDetail } from '$features/landing-page/domain/entities/landing-pricing.entity';
	import { ArrowLeft, Zap, Infinity as InfinityIcon, CheckCircle } from 'lucide-svelte';

	interface Props {
		detail: PricingDetail;
	}

	let { detail }: Props = $props();
	const backHref: ResolvedPathname = `${resolve('/')}#harga` as ResolvedPathname;
</script>

<!-- Breadcrumb & Back Navigation -->
<div class="mb-4 flex items-center gap-2">
	<a
		href={backHref}
		class="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3.5 py-1.5 text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container-high"
	>
		<ArrowLeft class="size-3.5" />
		Kembali
	</a>
</div>

<!-- Hero Overview Banner Section -->
<section
	class="relative mb-space-lg overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-low p-6 shadow-md sm:p-8 lg:p-10"
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
