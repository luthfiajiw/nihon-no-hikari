<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { CircleAlertIcon } from 'lucide-svelte';

	interface Props {
		variant: 'error' | 'empty';
		backHref: string;
		errorMessage?: string | null;
		isSubmitting?: boolean;
	}

	let { variant, backHref, errorMessage = null, isSubmitting = false }: Props = $props();
</script>

<Card.Root
	class="mx-auto mt-12 w-full max-w-xl rounded-2xl {variant === 'error' ? 'border-red-100' : ''}"
>
	<Card.Content class="flex flex-col items-center py-12 text-center">
		{#if variant === 'error'}
			<CircleAlertIcon class="size-12 text-red-500" />
			<h1 class="mt-4 text-xl font-extrabold text-slate-900">Set soal tidak dapat dimuat</h1>
			<p class="mt-2 text-sm text-red-600">
				{errorMessage || 'Detail set soal tidak tersedia.'}
			</p>
		{:else}
			<h1 class="text-xl font-extrabold text-slate-900">Belum ada soal</h1>
			<p class="mt-2 text-sm text-slate-500">Set soal ini belum memiliki pertanyaan.</p>
		{/if}

		<Button href={backHref} disabled={isSubmitting} class="mt-6 bg-sky-600 text-white">
			Kembali ke materi
		</Button>
	</Card.Content>
</Card.Root>
