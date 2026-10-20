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
	import { CodeXml, Eye, Lightbulb, LoaderCircle, RefreshCw } from 'lucide-svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Textarea } from '$lib/components/ui/textarea';
	import { previewLessonContent } from '$dependencies/admin-preview.dependency';
	import type { AdminLessonContent } from '../../domain/entities/admin.entity';

	let { value = $bindable({ content: '', tips: '' }) }: { value: AdminLessonContent } = $props();
	let mode = $state('html');
	let previewHTML = $state('');
	let previewError = $state('');
	let previewLoading = $state(false);
	let previewRevision = $state(0);
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

	$effect(() => {
		if (mode !== 'preview') return;
		const source = { content: value.content, tips: value.tips };
		void previewRevision;
		let cancelled = false;
		previewLoading = true;
		previewError = '';
		async function loadPreview() {
			try {
				const content = await previewLessonContent(source);
				if (cancelled) return;
				previewHTML = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font:16px/1.65 system-ui,sans-serif;color:#172033;padding:24px;max-width:900px;margin:auto}img{max-width:100%}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:8px}</style></head><body>${content.content}${content.tips ? `<blockquote>💡 ${content.tips.replaceAll('&', '&amp;').replaceAll('<', '&lt;')}</blockquote>` : ''}</body></html>`;
			} catch (err) {
				if (!cancelled) previewError = err instanceof Error ? err.message : 'Preview gagal.';
			} finally {
				if (!cancelled) previewLoading = false;
			}
		}
		void loadPreview();
		return () => {
			cancelled = true;
		};
	});
</script>

<div class="min-w-0 space-y-4">
	<Card.Root class="gap-0 p-0">
		<Tabs.Root bind:value={mode} class="min-w-0 flex-col gap-0">
			<div class="flex flex-wrap items-center justify-between gap-3 border-b p-3 sm:px-4">
				<Tabs.List aria-label="Mode konten pembelajaran" class="h-10 w-full sm:w-auto">
					<Tabs.Trigger value="html" class="gap-2 px-4">
						<CodeXml class="size-4" aria-hidden="true" />
						HTML
					</Tabs.Trigger>
					<Tabs.Trigger value="preview" class="gap-2 px-4">
						<Eye class="size-4" aria-hidden="true" />
						Preview
					</Tabs.Trigger>
				</Tabs.List>
				<p class="text-xs text-muted-foreground">
					{mode === 'html'
						? 'Susun materi pembelajaran dengan HTML.'
						: 'Periksa materi sebelum diterbitkan.'}
				</p>
			</div>
			<Tabs.Content value="html" class="min-w-0 space-y-3 p-4">
				<p id="lesson-html-label" class="text-sm font-medium">Kode HTML</p>
				<div
					bind:this={editorHost}
					class="w-full min-w-0 overflow-hidden rounded-lg border focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/50"
				></div>
				<p id="lesson-html-help" class="text-xs leading-relaxed text-muted-foreground">
					Tab / Shift+Tab untuk indentasi. Tekan Escape lalu Tab untuk keluar dari editor.
				</p>
			</Tabs.Content>
			<Tabs.Content value="preview" class="min-w-0 p-4" aria-busy={previewLoading}>
				{#if previewLoading}
					<div
						class="flex min-h-72 items-center justify-center gap-2 text-muted-foreground"
						role="status"
					>
						<LoaderCircle class="size-4 motion-safe:animate-spin" aria-hidden="true" />
						Menyiapkan preview…
					</div>
				{:else if previewError}
					<div
						class="flex min-h-72 flex-col items-center justify-center gap-4 rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center"
					>
						<div role="alert" class="space-y-1">
							<p class="font-medium text-destructive">Preview belum dapat ditampilkan</p>
							<p class="text-sm text-muted-foreground">{previewError}</p>
						</div>
						<Button type="button" variant="outline" onclick={() => previewRevision++}>
							<RefreshCw class="size-4" aria-hidden="true" />
							Coba lagi
						</Button>
					</div>
				{:else if mode === 'preview'}
					<iframe
						title="Preview konten lesson"
						sandbox=""
						srcdoc={previewHTML}
						class="h-[32rem] w-full rounded-lg border bg-white"
					></iframe>
				{/if}
			</Tabs.Content>
		</Tabs.Root>
	</Card.Root>
	<Card.Root size="sm" class="px-(--card-spacing)">
		<div class="flex items-start gap-3">
			<Lightbulb class="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
			<div class="space-y-1">
				<label class="text-sm font-medium" for="lesson-tips">Tips tambahan</label>
				<p id="lesson-tips-help" class="text-xs leading-relaxed text-muted-foreground">
					Tambahkan petunjuk atau pengingat untuk membantu siswa memahami materi. Opsional.
				</p>
			</div>
		</div>
		<Textarea
			id="lesson-tips"
			bind:value={value.tips}
			aria-describedby="lesson-tips-help"
			placeholder="Contoh: Latih pengucapan setiap kosakata dengan suara lantang."
			class="min-h-24 bg-background"
		/>
	</Card.Root>
</div>
