<script lang="ts">
	import * as Accordion from '$lib/components/ui/accordion';

	interface FaqItem {
		question: string;
		answer: string;
	}

	interface Props {
		faqs?: FaqItem[];
	}

	const DEFAULT_FAQS: FaqItem[] = [
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

	let { faqs = DEFAULT_FAQS }: Props = $props();
	let openFaq = $state<string>('faq-0');
</script>

<!-- FAQ Calon Pembeli -->
<section class="rounded-2xl border border-outline-variant/20 bg-white p-6 shadow-md sm:p-8">
	<div class="mb-6">
		<span class="font-label-md text-xs font-semibold tracking-wider text-primary uppercase">
			Punya Pertanyaan?
		</span>
		<h2 class="mt-1 font-headline-lg text-xl font-bold text-on-surface sm:text-2xl">
			FAQ Calon Pembeli
		</h2>
	</div>

	<Accordion.Root type="single" bind:value={openFaq} class="space-y-3">
		{#each faqs as faq, index (`faq-${index}`)}
			<Accordion.Item
				value={`faq-${index}`}
				class="rounded-xl border-none bg-surface-container-low px-4 py-1 transition-colors duration-200"
			>
				<Accordion.Trigger
					class="cursor-pointer text-left font-headline-sm text-sm font-semibold text-on-surface hover:no-underline sm:text-base"
				>
					{faq.question}
				</Accordion.Trigger>
				<Accordion.Content
					class="pb-3 font-body-md text-sm leading-relaxed text-on-surface-variant"
				>
					{faq.answer}
				</Accordion.Content>
			</Accordion.Item>
		{/each}
	</Accordion.Root>
</section>
