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
	import { CodeXml, Eye, Lightbulb, LoaderCircle, Maximize, RefreshCw, X } from 'lucide-svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Textarea } from '$lib/components/ui/textarea';
	import { previewCourseLessonContent } from '$dependencies/course-preview.dependency';
	import type { CourseAdminLessonContent } from '$features/course/domain/entities/course-admin.entity';

	let { value = $bindable({ content: '', tips: '' }) }: { value: CourseAdminLessonContent } =
		$props();
	let open = $state(false);
	let desktop = $state(false);
	let mode = $state('html');
	let previewHTML = $state('');
	let previewError = $state('');
	let previewLoading = $state(true);
	let previewRevision = $state(0);
	let maximizeButton = $state<HTMLButtonElement | null>(null);
	let editor = $state.raw<EditorView>();
	let savedEditorState: EditorView['state'] | undefined;
	let savedScrollTop = 0;
	let requestedPreview = false;
	let requestedRevision = 0;

	onMount(() => {
		const query = window.matchMedia('(min-width: 768px)');
		const update = () => (desktop = query.matches);
		update();
		query.addEventListener('change', update);
		return () => query.removeEventListener('change', update);
	});

	function mountEditor(host: HTMLDivElement) {
		const view = new EditorView({
			parent: host,
			state: savedEditorState,
			doc: value.content,
			extensions: [
				basicSetup,
				html(),
				syntaxHighlighting(
					HighlightStyle.define([
						...defaultHighlightStyle.specs,
						{ tag: tags.tagName, color: '#0f766e' },
						{ tag: tags.attributeName, color: 'var(--color-taupe-500)' },
						{ tag: tags.attributeValue, color: '#b91c1c' },
						{ tag: tags.comment, color: 'var(--color-taupe-500)', fontStyle: 'italic' }
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
					'&': { height: '100%', color: 'var(--color-taupe-900)', backgroundColor: '#fff' },
					'&.cm-focused': { outline: 'none' },
					'.cm-scroller': {
						fontFamily: 'var(--font-mono, monospace)',
						fontSize: '14px',
						lineHeight: '1.6',
						minHeight: '0',
						overflow: 'auto'
					},
					'.cm-content': { padding: '16px 0' },
					'.cm-line': { padding: '0 16px' },
					'.cm-gutters': {
						backgroundColor: 'var(--color-taupe-50)',
						color: 'var(--color-taupe-500)',
						borderColor: 'var(--color-taupe-200)'
					}
				})
			]
		});
		editor = view;
		const frame = requestAnimationFrame(() => {
			view.scrollDOM.scrollTop = savedScrollTop;
			view.requestMeasure();
		});
		return {
			destroy() {
				cancelAnimationFrame(frame);
				savedEditorState = view.state;
				savedScrollTop = view.scrollDOM.scrollTop;
				editor = undefined;
				view.destroy();
			}
		};
	}

	function openEditor() {
		mode = 'html';
		open = true;
	}

	$effect(() => {
		const view = editor;
		const content = value.content;
		// CodeMirror normalizes line endings internally; keep untouched source intact.
		if (view && view.state.doc.toString() !== content.replace(/\r\n?/g, '\n')) {
			view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: content } });
		}
	});

	$effect(() => {
		if (open && (desktop || mode === 'html')) editor?.requestMeasure();
	});

	$effect(() => {
		const source = { content: value.content, tips: value.tips };
		const revision = previewRevision;
		const immediate = !requestedPreview || revision !== requestedRevision;
		requestedPreview = true;
		requestedRevision = revision;
		let cancelled = false;
		previewLoading = true;
		previewError = '';
		async function loadPreview() {
			try {
				const content = await previewCourseLessonContent(source);
				if (cancelled) return;
				previewHTML = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font:16px/1.65 system-ui,sans-serif;color:#292524;padding:24px;max-width:900px;margin:auto}img{max-width:100%}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:8px}</style></head><body>${content.content}${content.tips ? `<blockquote>💡 ${content.tips.replaceAll('&', '&amp;').replaceAll('<', '&lt;')}</blockquote>` : ''}</body></html>`;
			} catch (err) {
				if (!cancelled) previewError = err instanceof Error ? err.message : 'Preview gagal.';
			} finally {
				if (!cancelled) previewLoading = false;
			}
		}
		const timer = setTimeout(() => void loadPreview(), immediate ? 0 : 300);
		return () => {
			cancelled = true;
			clearTimeout(timer);
		};
	});
</script>

{#snippet preview(title: string)}
	<div class="flex h-full min-h-0 min-w-0 flex-col gap-3" aria-busy={previewLoading}>
		{#if previewError}
			<div
				class="flex flex-1 flex-col items-center justify-center gap-4 overflow-auto rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center"
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
		{:else}
			{#if previewLoading}
				<div
					class={[
						'flex items-center gap-2 text-sm text-muted-foreground',
						previewHTML ? 'shrink-0' : 'flex-1 justify-center'
					]}
					role="status"
				>
					<LoaderCircle class="size-4 motion-safe:animate-spin" aria-hidden="true" />
					Menyiapkan preview…
				</div>
			{/if}
			{#if previewHTML}
				<iframe
					{title}
					sandbox=""
					srcdoc={previewHTML}
					class="min-h-0 w-full flex-1 rounded-lg border bg-white"
				></iframe>
			{/if}
		{/if}
	</div>
{/snippet}

{#snippet htmlPanel()}
	<div class="flex h-full min-h-0 min-w-0 flex-col gap-3">
		<p id="lesson-html-label" class="flex shrink-0 items-center gap-2 text-sm font-medium">
			<CodeXml class="size-4" aria-hidden="true" />
			Kode HTML
		</p>
		<div
			use:mountEditor
			class="min-h-0 w-full min-w-0 flex-1 overflow-hidden rounded-lg border focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/50"
		></div>
		<p id="lesson-html-help" class="shrink-0 text-xs leading-relaxed text-muted-foreground">
			Tab / Shift+Tab untuk indentasi. Tekan Escape lalu Tab untuk keluar dari editor.
		</p>
	</div>
{/snippet}

{#snippet previewPanel()}
	<div class="flex h-full min-h-0 min-w-0 flex-col gap-3">
		<p class="flex shrink-0 items-center gap-2 text-sm font-medium">
			<Eye class="size-4" aria-hidden="true" />
			Preview
		</p>
		<div class="min-h-0 flex-1">{@render preview('Preview langsung konten lesson')}</div>
	</div>
{/snippet}

<div class="min-w-0 space-y-4">
	<Card.Root class="gap-0 p-0">
		<div class="flex items-center justify-between gap-3 border-b p-3 sm:px-4">
			<p class="flex items-center gap-2 text-sm font-medium">
				<Eye class="size-4" aria-hidden="true" />
				Preview
			</p>
			<Button
				bind:ref={maximizeButton}
				type="button"
				variant="ghost"
				size="icon"
				aria-label="Buka editor konten pembelajaran"
				aria-haspopup="dialog"
				aria-expanded={open}
				onclick={openEditor}
			>
				<Maximize class="size-4" aria-hidden="true" />
			</Button>
		</div>
		<div class="h-[32rem] p-4">{@render preview('Preview konten lesson')}</div>
	</Card.Root>
	<Dialog.Root bind:open>
		<Dialog.Content
			class="flex h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-none flex-col gap-0 overflow-hidden p-0"
			onCloseAutoFocus={(event) => {
				event.preventDefault();
				maximizeButton?.focus();
			}}
			onEscapeKeydown={(event) => {
				// Let CodeMirror handle completion dismissal and Escape-then-Tab.
				if (editor?.hasFocus) event.preventDefault();
			}}
		>
			<div class="flex shrink-0 items-start justify-between gap-4 border-b p-4 md:px-6">
				<Dialog.Header class="text-left">
					<Dialog.Title>Editor Konten Pembelajaran</Dialog.Title>
					<Dialog.Description>
						Perubahan langsung diterapkan ke form. Gunakan Simpan Draft di halaman untuk menyimpan.
					</Dialog.Description>
				</Dialog.Header>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					aria-label="Tutup editor konten pembelajaran"
					onclick={() => (open = false)}
				>
					<X class="size-4" aria-hidden="true" />
				</Button>
			</div>
			{#if desktop}
				<div class="grid min-h-0 min-w-0 flex-1 grid-cols-2 gap-6 p-6">
					{@render htmlPanel()}
					{@render previewPanel()}
				</div>
			{:else}
				<Tabs.Root bind:value={mode} class="min-h-0 min-w-0 flex-1 flex-col gap-4 p-4">
					<Tabs.List aria-label="Mode konten pembelajaran" class="h-10 w-full shrink-0">
						<Tabs.Trigger value="html" class="flex-1 gap-2">
							<CodeXml class="size-4" aria-hidden="true" />HTML
						</Tabs.Trigger>
						<Tabs.Trigger value="preview" class="flex-1 gap-2">
							<Eye class="size-4" aria-hidden="true" />Preview
						</Tabs.Trigger>
					</Tabs.List>
					<Tabs.Content value="html" class="min-h-0 min-w-0">{@render htmlPanel()}</Tabs.Content>
					<Tabs.Content value="preview" class="min-h-0 min-w-0">
						{@render previewPanel()}
					</Tabs.Content>
				</Tabs.Root>
			{/if}
		</Dialog.Content>
	</Dialog.Root>
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
