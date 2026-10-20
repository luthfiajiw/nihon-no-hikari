<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { ArrowLeft, LoaderCircle, Save } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import AdminPageHeader from '../components/admin-page-header.svelte';
	import AdminSelect from '../components/admin-select.svelte';
	import KanaTemplatePreview from '../components/kana-template-preview.svelte';
	import {
		MAX_KANA_SVG_BYTES,
		type KanaTemplateDetail,
		type KanaTemplatePreview as Preview,
		type KanaStrokeData
	} from '../../domain/entities/kana-template.entity';
	import type { WritingGuide } from '$features/question/domain/entities/question.entity';

	let {
		data,
		form
	}: {
		data: { record: KanaTemplateDetail | null };
		form?: { message?: string } | null;
	} = $props();
	const initial = untrack(() => data.record);
	let item = $state({
		script: String(initial?.script ?? 'hiragana'),
		character: initial?.character ?? '',
		romaji: initial?.romaji ?? '',
		source_version: initial?.source_version ?? ''
	});
	let hasFile = $state(false);
	let svgContent = $state('');
	let fileError = $state('');
	let previewError = $state('');
	let reading = $state(false);
	let previewing = $state(false);
	let saving = $state(false);
	let converted = $state<KanaStrokeData | null>(null);
	let convertedKey = $state('');
	let fileRead = 0;
	const isNew = $derived(data.record === null);
	const geometryKey = $derived(
		JSON.stringify([item.script, item.character.normalize('NFC').trim(), svgContent])
	);
	const identityChanged = $derived(
		Boolean(
			data.record &&
			(item.script !== data.record.script ||
				item.character.normalize('NFC').trim() !== data.record.character)
		)
	);
	const strokeData = $derived(
		converted && convertedKey === geometryKey
			? converted
			: !hasFile && !identityChanged
				? (data.record?.stroke_data ?? null)
				: null
	);
	const guide: WritingGuide | null = $derived(
		strokeData
			? {
					character: item.character.normalize('NFC').trim(),
					romaji: item.romaji.trim(),
					...strokeData
				}
			: null
	);
	const busy = $derived(reading || previewing || saving);

	async function readSVG(event: Event) {
		const readID = ++fileRead;
		const file = (event.currentTarget as HTMLInputElement).files?.[0];
		hasFile = Boolean(file);
		svgContent = '';
		converted = null;
		fileError = '';
		previewError = '';
		reading = false;
		if (!file) return;
		if (file.size > MAX_KANA_SVG_BYTES) {
			fileError = 'Ukuran SVG maksimal 256 KiB.';
			return;
		}
		if (file.size === 0) {
			fileError = 'File SVG kosong.';
			return;
		}
		reading = true;
		try {
			const text = await file.text();
			if (readID === fileRead) svgContent = text;
		} catch {
			if (readID === fileRead) fileError = 'File SVG tidak dapat dibaca.';
		} finally {
			if (readID === fileRead) reading = false;
		}
	}

	async function previewSVG() {
		if (busy || !svgContent) return;
		previewing = true;
		previewError = '';
		const key = geometryKey;
		try {
			const response = await fetch(resolve('/api/admin/kana-template-preview'), {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ...item, svg_content: svgContent })
			});
			const result = (await response.json()) as { data?: Preview; error?: string };
			if (!response.ok || !result.data) throw new Error(result.error || 'Pratinjau gagal dimuat.');
			converted = result.data.stroke_data;
			convertedKey = key;
		} catch (cause) {
			previewError = cause instanceof Error ? cause.message : 'Pratinjau gagal dimuat.';
		} finally {
			previewing = false;
		}
	}

	const submit: SubmitFunction = ({ cancel }) => {
		if (busy || fileError) {
			cancel();
			return;
		}
		saving = true;
		return async ({ update }) => {
			try {
				await update({ reset: false });
			} finally {
				saving = false;
			}
		};
	};
</script>

<svelte:head>
	<title>{isNew ? 'Tambah' : 'Edit'} Template Kana | Admin - Nihongo no Hikari</title>
	<meta
		name="description"
		content="Tambah atau perbarui panduan menulis kana dengan SVG KanjiVG."
	/>
</svelte:head>

<div class="admin-page">
	<Button
		variant="outline"
		size="icon"
		aria-label="Kembali ke template kana"
		onclick={() => goto(resolve('/admin/kana-templates'))}
	>
		<ArrowLeft class="size-4" />
	</Button>
	<AdminPageHeader
		title={`${isNew ? 'Tambah' : 'Edit'} Template Kana`}
		description="Unggah satu SVG KanjiVG dan periksa panduan goresannya."
	/>
	{#if form?.message}<p class="admin-notice" role="status">{form.message}</p>{/if}
	{#if !isNew}
		<p class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
			Perubahan langsung digunakan soal pada attempt berikutnya. Attempt yang sedang dikerjakan
			tetap memakai panduan awal. Jika karakter atau romaji berubah, sesuaikan juga instruksi soal
			melalui editor question set.
		</p>
	{/if}
	<div class="grid items-start gap-6 xl:grid-cols-2">
		<form
			method="POST"
			action="?/save"
			enctype="multipart/form-data"
			use:enhance={submit}
			data-slot="card"
			data-size="default"
			class={Card.cardVariants({ class: 'admin-stack block px-(--card-spacing)' })}
		>
			<fieldset disabled={busy} class="admin-stack min-w-0">
				<div class="space-y-2 text-sm font-medium">
					<label for="template-script">Script</label>
					<AdminSelect
						id="template-script"
						bind:value={item.script}
						options={[
							{ value: 'hiragana', label: 'Hiragana' },
							{ value: 'katakana', label: 'Katakana' }
						]}
					/>
					<input type="hidden" name="script" value={item.script} />
				</div>
				<div class="admin-fields">
					<label class="space-y-2 text-sm font-medium">
						Karakter
						<Input name="character" bind:value={item.character} required placeholder="あ" />
					</label>
					<label class="space-y-2 text-sm font-medium">
						Romaji
						<Input name="romaji" bind:value={item.romaji} required maxlength={8} placeholder="a" />
					</label>
				</div>
				<label class="space-y-2 text-sm font-medium">
					Versi sumber
					<Input
						name="source_version"
						bind:value={item.source_version}
						required
						placeholder="Contoh: r20260714"
					/>
				</label>
				<div class="space-y-2 text-sm">
					<label for="template-svg" class="font-medium">
						SVG KanjiVG {isNew || identityChanged ? '(wajib)' : '(pengganti, opsional)'}
					</label>
					<Input
						id="template-svg"
						name="svg_file"
						type="file"
						accept=".svg,image/svg+xml"
						required={isNew || identityChanged}
						onchange={readSVG}
						aria-describedby="template-svg-help"
					/>
					<p id="template-svg-help" class="text-muted-foreground">
						Maksimal 256 KiB, viewBox 0 0 109 109. SVG harus cocok dengan karakter yang diisi.
					</p>
					{#if identityChanged}<p class="text-amber-800">
							Unggah SVG pengganti karena script atau karakter berubah.
						</p>{/if}
					{#if fileError}<p role="alert" class="text-red-700">{fileError}</p>{/if}
				</div>
			</fieldset>
			{#if previewError}<p role="alert" class="text-sm text-red-700">{previewError}</p>{/if}
			<div class="flex flex-wrap gap-2">
				<Button
					type="button"
					variant="outline"
					disabled={busy || !svgContent || Boolean(fileError)}
					onclick={previewSVG}
					aria-busy={previewing}
				>
					{#if previewing}<LoaderCircle class="size-4 animate-spin" />{/if} Pratinjau SVG
				</Button>
				<Button type="submit" disabled={busy || Boolean(fileError)} aria-busy={saving}>
					{#if saving}<LoaderCircle class="size-4 animate-spin" />{:else}<Save
							class="size-4"
						/>{/if}
					{saving ? 'Menyimpan...' : 'Simpan Template'}
				</Button>
			</div>
			<p class="text-xs text-muted-foreground">
				Template langsung tersedia untuk dipilih pada soal writing setelah disimpan.
			</p>
		</form>
		<Card.Root role="region" aria-label="Pratinjau template kana" class="gap-0 px-(--card-spacing)">
			{#if guide}
				{#key JSON.stringify(guide)}<KanaTemplatePreview {guide} />{/key}
			{:else}
				<p class="py-12 text-center text-sm text-muted-foreground">
					Isi metadata, unggah SVG, lalu pilih Pratinjau SVG untuk memeriksa bentuk dan arah
					goresan.
				</p>
				<p class="text-center text-xs text-muted-foreground">
					Sumber panduan: KanjiVG · © Ulrich Apel dan kontributor · CC BY-SA 3.0.
				</p>
			{/if}
		</Card.Root>
	</div>
</div>
