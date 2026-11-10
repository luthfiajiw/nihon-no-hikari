<script lang="ts">
	import { BadgeCheck, CircleCheck, Tag } from 'lucide-svelte';
	import { viewportReveal } from '$lib/actions/viewport-reveal';
	import type { PricingPlan } from '$features/landing-page/domain/entities/landing-pricing.entity';

	let { plans = [] }: { plans?: PricingPlan[] } = $props();

	function formatPrice(price: number): { amount: string; subtitle: string } {
		const amount = price === 0 ? 'Gratis' : 'Rp ' + new Intl.NumberFormat('id-ID').format(price);
		const subtitle = price === 0 ? 'Akses gratis selamanya' : 'Sekali bayar • Akses selamanya';
		return { amount, subtitle };
	}
</script>

<!-- SECTION 5: PILIHAN PAKET & HARGA -->
{#if plans.length > 0}
	<section class="w-full scroll-mt-24 bg-surface-container-low py-space-xl" id="harga">
		<div class="mx-auto max-w-7xl px-gutter">
			<div class="mx-auto mb-space-xl max-w-3xl text-center" use:viewportReveal={{ direction: 'up' }}>
				<div
					class="mb-space-sm inline-flex items-center gap-1.5 rounded-full bg-primary-fixed px-3.5 py-1 text-label-sm font-semibold text-on-primary-fixed"
				>
					<Tag class="size-4" /> Pilihan Paket &amp; Investasi Belajar
				</div>
				<h2 class="mb-2 font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">
					Pilih Paket Belajar Sesuai Target JLPT Anda
				</h2>
				<p class="mx-auto max-w-2xl font-body-md text-body-md text-on-surface-variant">
					Akses modul terstruktur, ribuan flashcard kosakata SRS, latihan soal simulasi resmi, dan AI
					Sensei personal tutor. Pilih satuan level atau paket hemat bertahap.
				</p>
				<div
					class="mt-4 inline-flex items-center gap-2 rounded-full bg-surface-container-highest px-4 py-1.5 text-label-sm font-semibold text-on-surface"
				>
					<BadgeCheck class="size-4 text-primary-container" />
					Akses Sekali Bayar (Lifetime Access) • Garansi Update Materi
				</div>
			</div>

			<div
				class="mb-space-lg grid items-stretch gap-4 {plans.length === 1
					? 'mx-auto max-w-sm grid-cols-1'
					: plans.length === 2
						? 'mx-auto max-w-2xl grid-cols-1 md:grid-cols-2'
						: plans.length === 3
							? 'mx-auto max-w-5xl grid-cols-1 md:grid-cols-3'
							: plans.length === 4
								? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
								: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5'}"
			>
				{#each plans as plan, index (plan.id)}
					{@const { amount, subtitle } = formatPrice(plan.price)}
					<div
						class="flex flex-col justify-between rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-sm transition-all hover:shadow-md"
						use:viewportReveal={{ direction: 'up', delay: Math.min(index * 80, 400) }}
					>
						<div class="flex flex-col">
							<div class="mb-2 flex items-center justify-between">
								<span
									class="rounded-full bg-surface-container-highest px-2.5 py-0.5 font-label-sm text-label-sm font-bold text-on-surface"
								>
									{plan.code}
								</span>
								{#if plan.tag}
									<span
										class="rounded-full bg-secondary-fixed px-2 py-0.5 font-label-sm text-[10px] font-bold text-on-secondary-fixed"
									>
										{plan.tag}
									</span>
								{/if}
							</div>
							<h3 class="mb-0.5 font-headline-sm text-[18px] font-bold text-on-surface">{plan.name}</h3>
							{#if plan.description}
								<p class="mb-3 font-body-sm text-[12px] text-on-surface-variant">
									{plan.description}
								</p>
							{/if}
							<div class="mb-4">
								<div class="text-[22px] leading-none font-bold text-on-surface">{amount}</div>
								<div class="mt-0.5 text-[11px] text-outline">{subtitle}</div>
							</div>
							{#if plan.points && plan.points.length > 0}
								<div
									class="mb-6 space-y-2 border-t border-outline-variant/30 pt-3 font-body-sm text-[12px] text-on-surface-variant"
								>
									{#each plan.points as point}
										<div class="flex items-start gap-1.5">
											<CircleCheck class="mt-0.5 size-4 shrink-0 text-primary-container" />
											<span>{point}</span>
										</div>
									{/each}
								</div>
							{/if}
						</div>
						<a
							class="block w-full rounded-full bg-surface-container py-2.5 text-center font-label-md text-label-md font-bold text-on-surface transition-colors hover:bg-surface-container-high"
							href="/pricing/{plan.code.toLowerCase()}"
						>
							Lihat Detail {plan.code}
						</a>
					</div>
				{/each}
			</div>
		</div>
	</section>
{/if}
