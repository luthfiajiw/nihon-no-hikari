<script lang="ts">
	import { onDestroy } from 'svelte';
	import { FileAudio, ImagePlus, LoaderCircle, Trash2, Upload } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import Cover from './admin-kotoba-cover.svelte';
	import { validateMedia, type KotobaMedia } from '../models/admin-kotoba.model';
	let {
		kind,
		value = $bindable(null),
		id,
		label,
		error = '',
		onPlay
	}: {
		kind: 'cover' | 'audio';
		value?: KotobaMedia | null;
		id: string;
		label: string;
		error?: string;
		onPlay?: (audio: HTMLAudioElement) => void;
	} = $props();
	let fileError = $state('');
	let reading = $state(false);
	let fileURL = $state('');
	let audio: HTMLAudioElement | undefined = $state();
	let fileInput = $state<HTMLInputElement>(null!);
	let readVersion = 0;
	const source = $derived(value?.file ? fileURL : value?.url);
	const message = $derived(fileError || error);
	$effect(() => {
		const file = value?.file;
		if (kind !== 'audio' || !file) {
			fileURL = '';
			return;
		}
		const url = URL.createObjectURL(file);
		fileURL = url;
		return () => {
			audio?.pause();
			URL.revokeObjectURL(url);
		};
	});
	onDestroy(() => {
		readVersion++;
		audio?.pause();
	});

	function verifyAudio(url: string): Promise<void> {
		return new Promise((resolve, reject) => {
			const probe = new Audio();
			const timeout = window.setTimeout(() => finish(false), 10000);
			function finish(valid: boolean) {
				window.clearTimeout(timeout);
				probe.onloadedmetadata = null;
				probe.onerror = null;
				probe.removeAttribute('src');
				probe.load();
				if (valid) resolve();
				else reject(new Error('Unreadable MP3'));
			}
			probe.preload = 'metadata';
			probe.onloadedmetadata = () => finish(true);
			probe.onerror = () => finish(false);
			probe.src = url;
		});
	}

	async function selectFile(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (!file) return;
		const version = ++readVersion;
		fileError = validateMedia(file, kind);
		reading = false;
		if (fileError) return;
		reading = true;
		const url = URL.createObjectURL(file);
		try {
			if (kind === 'cover') {
				const image = new Image();
				image.src = url;
				await image.decode();
			} else {
				await verifyAudio(url);
			}
		} catch {
			if (version === readVersion)
				fileError =
					kind === 'cover'
						? 'Gambar tidak dapat dibaca. Pilih gambar lain.'
						: 'Audio tidak dapat dibaca. Pilih file MP3 lain.';
			return;
		} finally {
			URL.revokeObjectURL(url);
			if (version === readVersion) reading = false;
		}
		if (version !== readVersion) return;
		audio?.pause();
		value = { file, url: '' };
	}

	function remove() {
		readVersion++;
		reading = false;
		audio?.pause();
		value = null;
		fileError = '';
	}
</script>

<div class="min-w-0 space-y-2" data-media={kind}>
	<label for={id} class="text-sm font-medium">{label}</label>
	<div class={kind === 'cover' && value ? 'grid min-w-0 gap-4 sm:grid-cols-2' : 'space-y-2'}>
		{#if value}
			<div class="relative min-w-0">
				{#if kind === 'cover'}
					<Cover media={value} alt="Preview cover topik" class="h-32 w-full min-w-0" />
				{:else}
					{#key source}
						<audio
							bind:this={audio}
							src={source || undefined}
							controls
							preload="metadata"
							aria-label={`Preview ${label}`}
							class="h-10 w-full min-w-0"
							onplay={(event) => onPlay?.(event.currentTarget)}
							onerror={() => {
								fileError = 'Audio tidak dapat diputar. Coba file MP3 lain.';
							}}
						></audio>
					{/key}
				{/if}
			</div>
		{/if}
		<div
			class="flex min-w-0 flex-col justify-center gap-2 rounded-xl border border-dashed bg-muted/30 p-3 sm:p-4"
		>
			{#if kind === 'cover'}
				<ImagePlus class="size-5 text-primary" aria-hidden="true" />
			{:else}
				<FileAudio class="size-5 text-primary" aria-hidden="true" />
			{/if}
			<p class="text-xs leading-relaxed text-muted-foreground">
				{kind === 'cover'
					? 'PNG atau JPG, maksimal 2 MiB. Rekomendasi 1200 × 400.'
					: 'MP3, maksimal 1 MiB. Audio pengucapan bersifat opsional.'}
			</p>
			{#if value?.file}<p class="truncate text-xs font-medium" title={value.file.name}>
					{value.file.name}
				</p>{/if}
			<div class="flex flex-wrap items-center gap-2">
				<Button variant="outline" size="sm" onclick={() => fileInput.click()} disabled={reading}>
					{#if reading}<LoaderCircle class="size-4 animate-spin" />{:else}<Upload
							class="size-4"
						/>{/if}
					{value ? 'Ganti' : 'Unggah'}
					{kind === 'cover' ? 'Cover' : 'Audio'}
				</Button>
				{#if value}
					<Button variant="ghost" size="icon-sm" aria-label={`Hapus ${label}`} onclick={remove}>
						<Trash2 class="size-4 text-destructive" />
					</Button>
				{/if}
			</div>
		</div>
	</div>
	<input
		type="file"
		{id}
		bind:this={fileInput}
		class="sr-only"
		tabindex={-1}
		accept={kind === 'cover' ? '.png,.jpg,.jpeg,image/png,image/jpeg' : '.mp3,audio/mpeg'}
		aria-invalid={Boolean(message)}
		aria-describedby={message ? `${id}-error` : undefined}
		onchange={selectFile}
	/>
	{#if message}<p id={`${id}-error`} class="text-xs text-destructive" role="alert">
			{message}
		</p>{/if}
</div>
