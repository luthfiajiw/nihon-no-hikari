<script lang="ts">
	import { previewLessonContent } from '$dependencies/admin-preview.dependency';
	import type { AdminLessonContent } from '../../domain/entities/admin.entity';
	import { onMount } from 'svelte';
	import { Editor, Node } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Image from '@tiptap/extension-image';
	import { TableKit } from '@tiptap/extension-table';
	import { TextStyle, FontSize, BackgroundColor } from '@tiptap/extension-text-style';
	import Color from '@tiptap/extension-color';
	import TextAlign from '@tiptap/extension-text-align';

	let { value = $bindable({ content: '', tips: '' }) }: { value: AdminLessonContent } = $props();
	let mount = $state<HTMLElement>();
	let editor: Editor | null = $state(null);
	let mode = $state<'visual' | 'html' | 'preview'>('visual');
	let previewHTML = $state('');
	let previewError = $state('');

	const AudioBlock = Node.create({
		name: 'lessonAudio',
		group: 'block',
		atom: true,
		addAttributes() {
			return {
				audio: {
					default: '',
					parseHTML: (element) => element.getAttribute('data-audio'),
					renderHTML: (attributes) => ({ 'data-audio': attributes.audio })
				}
			};
		},
		parseHTML() {
			return [{ tag: 'div[data-audio]' }];
		},
		renderHTML({ HTMLAttributes }) {
			return ['div', HTMLAttributes, ['button', { 'data-play-audio': '' }, '▶ Putar audio']];
		}
	});

	onMount(() => {
		const instance = new Editor({
			element: mount,
			extensions: [
				StarterKit,
				Image,
				TableKit,
				TextStyle,
				Color,
				FontSize,
				BackgroundColor,
				TextAlign.configure({ types: ['heading', 'paragraph'] }),
				AudioBlock
			],
			content: value.content || '<p></p>',
			onUpdate: ({ editor }) => {
				value.content = editor.getHTML();
			}
		});
		editor = instance;
		return () => instance.destroy();
	});

	function showVisual() {
		if (!editor) return;
		if (mode === 'html') {
			const previousVisual = editor.getHTML();
			editor.commands.setContent(value.content || '<p></p>', { emitUpdate: false });
			const normalized = editor.getHTML();
			if (
				normalized !== value.content &&
				!window.confirm('Mode visual dapat menyederhanakan HTML yang tidak didukung. Lanjutkan?')
			) {
				editor.commands.setContent(previousVisual, { emitUpdate: false });
				return;
			}
			value.content = normalized;
		}
		mode = 'visual';
	}

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
			onclick={showVisual}
			class:font-bold={mode === 'visual'}
			class="rounded-md px-4 py-2 text-sm hover:bg-slate-100">Visual</button
		>
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
	{#if mode === 'visual'}
		<div class="flex flex-wrap gap-2 text-sm">
			<button
				type="button"
				class="rounded border px-3 py-2"
				onclick={() => editor?.chain().focus().toggleBold().run()}><b>B</b></button
			>
			<button
				type="button"
				class="rounded border px-3 py-2"
				onclick={() => editor?.chain().focus().toggleItalic().run()}><i>I</i></button
			>
			<button
				type="button"
				class="rounded border px-3 py-2"
				onclick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button
			>
			<button
				type="button"
				class="rounded border px-3 py-2"
				onclick={() => editor?.chain().focus().toggleBulletList().run()}>Daftar</button
			>
			<button
				type="button"
				class="rounded border px-3 py-2"
				onclick={() => editor?.chain().focus().setTextAlign('center').run()}>Tengah</button
			>
			<button
				type="button"
				class="rounded border px-3 py-2"
				onclick={() =>
					editor?.chain().focus().insertTable({ rows: 2, cols: 2, withHeaderRow: true }).run()}
				>Tabel</button
			>
			<label class="flex items-center gap-1 rounded border px-3 py-2"
				>Warna <input
					type="color"
					value="#172033"
					onchange={(event) => editor?.chain().focus().setColor(event.currentTarget.value).run()}
				/></label
			>
			<label class="flex items-center gap-1 rounded border px-3 py-2"
				>Ukuran <select
					aria-label="Ukuran huruf"
					onchange={(event) => editor?.chain().focus().setFontSize(event.currentTarget.value).run()}
					><option value="16px">16</option><option value="20px">20</option><option value="24px"
						>24</option
					><option value="32px">32</option></select
				></label
			>
			<button
				type="button"
				class="rounded border px-3 py-2"
				onclick={() => {
					const link = window.prompt('URL tautan (https://)');
					if (link) editor?.chain().focus().setLink({ href: link }).run();
				}}>Tautan</button
			>
			<button
				type="button"
				class="rounded border px-3 py-2"
				onclick={() => {
					const src = window.prompt('URL gambar (https://)');
					if (src) editor?.chain().focus().setImage({ src }).run();
				}}>Gambar</button
			>
			<button
				type="button"
				class="rounded border px-3 py-2"
				onclick={() => {
					const path = window.prompt('Path audio lesson yang tersedia');
					if (path)
						editor
							?.chain()
							.focus()
							.insertContent({ type: 'lessonAudio', attrs: { audio: path } })
							.run();
				}}>Audio</button
			>
		</div>
	{/if}
	<div
		bind:this={mount}
		class:hidden={mode !== 'visual'}
		class="min-h-64 rounded-lg border border-slate-300 bg-white p-4 [&_.ProseMirror]:min-h-56 [&_.ProseMirror]:outline-none"
	></div>
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
