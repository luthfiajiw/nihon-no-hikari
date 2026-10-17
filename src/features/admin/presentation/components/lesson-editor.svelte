<script lang="ts">
	import { onMount } from 'svelte';
	import { basicSetup } from 'codemirror';
	import { html } from '@codemirror/lang-html';
	import { EditorView, keymap } from '@codemirror/view';
	import { indentWithTab } from '@codemirror/commands';
	import {
		defaultHighlightStyle,
		HighlightStyle,
		indentUnit,
		syntaxHighlighting
	} from '@codemirror/language';
	import { tags } from '@lezer/highlight';
	import { previewLessonContent } from '$dependencies/admin-preview.dependency';
	import type { AdminLessonContent } from '../../domain/entities/admin.entity';

	let { value = $bindable({ content: '', tips: '' }) }: { value: AdminLessonContent } = $props();
	let mode = $state<'html' | 'preview'>('html');
	let previewHTML = $state('');
	let previewError = $state('');
	let editorHost: HTMLDivElement;
	let editor = $state.raw<EditorView>();

	onMount(() => {
		const view = new EditorView({
			parent: editorHost,
			doc: value.content,
			extensions: [
				basicSetup,
				html(),
				syntaxHighlighting(
					HighlightStyle.define([
						...defaultHighlightStyle.specs,
						{ tag: tags.tagName, color: '#0f766e' },
						{ tag: tags.attributeName, color: '#1d4ed8' },
						{ tag: tags.attributeValue, color: '#b91c1c' },
						{ tag: tags.comment, color: '#64748b', fontStyle: 'italic' }
					])
				),
				indentUnit.of('  '),
				keymap.of([indentWithTab]),
				EditorView.lineWrapping,
				EditorView.contentAttributes.of({
					id: 'lesson-html',
					'aria-labelledby': 'lesson-html-label',
					'aria-describedby': 'lesson-html-help',
					spellcheck: 'false'
				}),
				EditorView.updateListener.of((update) => {
					if (update.docChanged) value.content = update.state.doc.toString();
				}),
				EditorView.theme({
					'&': { color: '#0f172a', backgroundColor: '#fff' },
					'&.cm-focused': { outline: 'none' },
					'.cm-scroller': {
						fontFamily: 'var(--font-mono, monospace)',
						fontSize: '14px',
						lineHeight: '1.6',
						minHeight: '18rem',
						maxHeight: '32rem',
						overflow: 'auto'
					},
					'.cm-content': { padding: '16px 0' },
					'.cm-line': { padding: '0 16px' },
					'.cm-gutters': {
						backgroundColor: '#f8fafc',
						color: '#64748b',
						borderColor: '#e2e8f0'
					}
				})
			]
		});
		editor = view;
		return () => {
			editor = undefined;
			view.destroy();
		};
	});

	$effect(() => {
		const view = editor;
		const content = value.content;
		// CodeMirror normalizes line endings internally; keep untouched source intact.
		if (view && view.state.doc.toString() !== content.replace(/\r\n?/g, '\n')) {
			view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: content } });
		}
	});

	$effect(() => {
		if (mode === 'html') editor?.requestMeasure();
	});

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
			class="rounded-md px-4 py-2 text-sm hover:bg-slate-100"
		>
			HTML
		</button>
		<button
			type="button"
			onclick={showPreview}
			class:font-bold={mode === 'preview'}
			class="rounded-md px-4 py-2 text-sm hover:bg-slate-100"
		>
			Preview
		</button>
	</div>
	<div hidden={mode !== 'html'} class="min-w-0 space-y-4">
		<p id="lesson-html-label" class="text-sm font-medium">Kode HTML</p>
		<div
			bind:this={editorHost}
			class="w-full min-w-0 overflow-hidden rounded-lg border border-slate-300 focus-within:ring-2 focus-within:ring-indigo-500"
		></div>
		<p id="lesson-html-help" class="text-xs text-slate-500">
			Tab / Shift+Tab untuk indentasi. Tekan Escape lalu Tab untuk keluar dari editor.
		</p>
	</div>
	{#if mode === 'preview'}
		<iframe
			title="Preview konten lesson"
			sandbox=""
			srcdoc={previewHTML}
			class="h-[32rem] w-full rounded-lg border bg-white"
		></iframe>
	{/if}
	{#if previewError}
		<p class="text-sm text-red-700" role="alert">{previewError}</p>
	{/if}
	<label class="block text-sm font-medium" for="lesson-tips">Tips tambahan</label>
	<textarea
		id="lesson-tips"
		bind:value={value.tips}
		class="min-h-20 w-full rounded-lg border border-slate-300 p-4 text-sm"></textarea>
</div>
