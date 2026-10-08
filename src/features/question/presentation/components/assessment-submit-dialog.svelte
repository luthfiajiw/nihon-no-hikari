<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';

	interface Props {
		open?: boolean;
		unansweredCount: number;
		submitError?: string | null;
		isSubmitting?: boolean;
		onSubmit: () => void | Promise<void>;
	}

	let {
		open = $bindable(false),
		unansweredCount,
		submitError = null,
		isSubmitting = false,
		onSubmit
	}: Props = $props();
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Kirim jawaban?</Dialog.Title>
			<Dialog.Description>
				Jawaban yang sudah dikirim tidak dapat diubah.
				{#if unansweredCount > 0}
					Masih ada {unansweredCount} soal yang belum dijawab.
				{:else}
					Semua soal sudah dijawab.
				{/if}
			</Dialog.Description>
		</Dialog.Header>

		{#if submitError}
			<div class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
				{submitError}
			</div>
		{/if}

		<Dialog.Footer>
			<Button
				type="button"
				variant="outline"
				disabled={isSubmitting}
				onclick={() => (open = false)}
			>
				Periksa lagi
			</Button>
			<Button
				type="button"
				disabled={isSubmitting}
				isLoading={isSubmitting}
				onclick={onSubmit}
				class="bg-sky-600 text-white"
			>
				{isSubmitting ? 'Mengirim...' : 'Ya, kirim jawaban'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
