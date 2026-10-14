<script lang="ts">
	import { previewLessonContent } from '$dependencies/admin-preview.dependency';
	import type { AdminLessonContent } from '../../domain/entities/admin.entity';

	let { value = $bindable({ content: '', tips: '' }) }: { value: AdminLessonContent } = $props();
	let mode = $state<'html' | 'preview'>('html');
	let previewHTML = $state('');
	let previewError = $state('');

	async function showPreview() {
		previewError = '';
		try {
			const content = await previewLessonContent(value);
			previewHTML = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font:16px/1.65 system-ui,sans-serif;color:#172033;padding:24px;max-width:900px;margin:auto}img{max-width:100%}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:8px}</style></head><body>${content.content}${content.tips ? `<blockquote>💡 ${content.tips.replaceAll('&', '&amp;').replaceAll('<', '&lt;')}</blockquote>` : ''}</body></html>`;
			mode = 'preview';
		} catch (err) {
			previewError = err instanceof Error ? err.message : 'Preview gagal.';
		}
	}
</script>

<div class="admin-stack">
	<div class="flex flex-wrap gap-2 border-b pb-4">
		<button
			type="button"
			onclick={() => (mode = 'html')}
			class:font-bold={mode === 'html'}
			class="rounded-md px-4 py-2 text-sm hover:bg-slate-100">HTML</button
		>
		<button
			type="button"
			onclick={showPreview}
			class:font-bold={mode === 'preview'}
			class="rounded-md px-4 py-2 text-sm hover:bg-slate-100">Preview</button
		>
	</div>
	{#if mode === 'html'}
		<label class="block text-sm font-medium" for="lesson-html">Kode HTML</label>
		<textarea
			id="lesson-html"
			bind:value={value.content}
			spellcheck="false"
			class="min-h-72 w-full rounded-lg border border-slate-300 p-4 font-mono text-sm"></textarea>
	{:else if mode === 'preview'}
		<iframe
			title="Preview konten lesson"
			sandbox=""
			srcdoc={previewHTML}
			class="h-[32rem] w-full rounded-lg border bg-white"
		></iframe>
	{/if}
	{#if previewError}<p class="text-sm text-red-700" role="alert">{previewError}</p>{/if}
	<label class="block text-sm font-medium" for="lesson-tips">Tips tambahan</label>
	<textarea
		id="lesson-tips"
		bind:value={value.tips}
		class="min-h-20 w-full rounded-lg border border-slate-300 p-4 text-sm"></textarea>
</div>
