<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { kotobaRepository } from '$dependencies/kotoba.dependency';
	import { KotobaError } from '$features/kotoba/domain/entities/kotoba-api.entity';
	import { mediaNeedsRefresh } from '$features/kotoba/presentation/models/kotoba-api.model';
	import {
		kotobaAdminTopic,
		saveKotobaAdminTopic,
		kotobaAdminFieldErrors,
		refreshKotobaAdminMedia
	} from '$features/kotoba/presentation/models/kotoba-admin-api.model';
	import { onMount, tick, untrack } from 'svelte';
	import { flip } from 'svelte/animate';
	import { MediaQuery } from 'svelte/reactivity';
	import {
		dragHandleZone,
		SHADOW_ITEM_MARKER_PROPERTY_NAME,
		SOURCES,
		TRIGGERS,
		type DndEvent
	} from 'svelte-dnd-action';
	import { ArrowLeft } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Badge } from '$lib/components/ui/badge';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Card from '$lib/components/ui/card';
	import { kotobaLevels } from '$features/kotoba/data/kotoba-topics';
	import ManagementPageHeader from '$lib/components/management-page-header.svelte';
	import ManagementSelect from '$lib/components/management-select.svelte';
	import Cover from '$features/kotoba/presentation/components/kotoba-admin-cover.svelte';
	import MediaInput from '$features/kotoba/presentation/components/kotoba-admin-media-input.svelte';
	import VocabularyEditor from '$features/kotoba/presentation/components/kotoba-admin-vocabulary-editor.svelte';
	import { getKotobaAdminState } from '$features/kotoba/presentation/contexts/kotoba-admin-context.svelte';
	import {
		cloneKotobaAdminTopic,
		cloneKotobaAdminVocabulary,
		emptyKotobaAdminVocabulary,
		validateKotobaAdminTopic,
		type KotobaAdminTopic,
		type KotobaAdminVocabulary
	} from '$features/kotoba/presentation/models/kotoba-admin.model';

	let { id, initial }: { id: string; initial: KotobaAdminTopic } = $props();
	const kotoba = getKotobaAdminState();
	let item = $state(untrack(() => cloneKotobaAdminTopic(initial)));
	let saving = $state(false);
	let message = $state('');
	let progress = $state('');
	let conflict = $state(false);
	let serverErrors = $state<Record<string, string>>({});
	let expanded = $state<Record<string, boolean>>(
		Object.fromEntries(item.vocabulary.map((word, index) => [word.id, index < 2]))
	);
	let submitted = $state(false);
	let dragging = $state(false);
	let formElement = $state<HTMLFormElement>(null!);
	let playingAudio: HTMLAudioElement | null = null;
	let beforeDrag: KotobaAdminVocabulary[] | null = null;
	let dragSource: SOURCES | null = null;
	let cancelled = false;
	const errors = $derived(submitted ? { ...serverErrors, ...validateKotobaAdminTopic(item) } : {});
	const reducedMotion = new MediaQuery('(prefers-reduced-motion: reduce)');
	const flipDurationMs = $derived(reducedMotion.current ? 0 : 220);
	type SortableWord = KotobaAdminVocabulary & { isDndShadowItem?: boolean };
	const words = $derived(item.vocabulary as SortableWord[]);

	function onPlay(audio: HTMLAudioElement) {
		if (playingAudio !== audio) playingAudio?.pause();
		playingAudio = audio;
	}
	function addWord(source?: KotobaAdminVocabulary) {
		const word = source
			? { ...cloneKotobaAdminVocabulary(source), id: crypto.randomUUID(), serverId: undefined }
			: emptyKotobaAdminVocabulary(crypto.randomUUID());
		const index = source
			? item.vocabulary.findIndex((candidate) => candidate.id === source.id) + 1
			: item.vocabulary.length;
		item.vocabulary.splice(index, 0, word);
		expanded[word.id] = true;
	}
	function finishDrag(next: KotobaAdminVocabulary[]) {
		item.vocabulary = cancelled && beforeDrag ? beforeDrag : next;
		beforeDrag = null;
		dragging = false;
	}
	function consider(event: CustomEvent<DndEvent<SortableWord>>) {
		const { items, info } = event.detail;
		if (info.trigger === TRIGGERS.DRAG_STARTED) {
			beforeDrag = [...item.vocabulary];
			dragSource = info.source;
			cancelled = false;
			dragging = true;
			playingAudio?.pause();
		}
		if (info.trigger === TRIGGERS.DRAG_STOPPED) finishDrag(items);
		else item.vocabulary = items;
	}
	function finalize(event: CustomEvent<DndEvent<SortableWord>>) {
		if (event.detail.info.source === SOURCES.KEYBOARD) item.vocabulary = event.detail.items;
		else {
			if (event.detail.info.trigger === TRIGGERS.DROPPED_OUTSIDE_OF_ANY) cancelled = true;
			finishDrag(event.detail.items);
		}
	}
	onMount(() => {
		let disposed = false;
		let refreshing = false;
		async function refresh() {
			if (id === 'new' || saving || refreshing || !mediaNeedsRefresh(item.mediaExpiresAt)) return;
			refreshing = true;
			try {
				const fresh = kotobaAdminTopic(await kotobaRepository.detail(id, true));
				if (!disposed) refreshKotobaAdminMedia(item, fresh);
			} catch {
				if (!disposed) message = 'Media belum dapat diperbarui. Coba lagi sebentar.';
			} finally {
				refreshing = false;
			}
		}
		const timer = window.setInterval(() => void refresh(), 60_000);
		window.addEventListener('focus', refresh);
		function cancelDrag(event: KeyboardEvent) {
			if (!beforeDrag || (event.key !== 'Escape' && event.key !== 'Tab')) return;
			cancelled = true;
			if (dragSource === SOURCES.POINTER) window.dispatchEvent(new MouseEvent('mouseup'));
			else if (event.key === 'Tab')
				window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		}
		window.addEventListener('keydown', cancelDrag, true);
		return () => {
			disposed = true;
			window.clearInterval(timer);
			window.removeEventListener('focus', refresh);
			window.removeEventListener('keydown', cancelDrag, true);
			playingAudio?.pause();
		};
	});
	async function save(event: SubmitEvent) {
		event.preventDefault();
		if (dragging || saving) return;
		if (formElement.querySelector('[data-media][aria-busy="true"]')) {
			message = 'Tunggu hingga file selesai diperiksa.';
			return;
		}
		submitted = true;
		serverErrors = {};
		message = '';
		conflict = false;
		if (Object.keys(validateKotobaAdminTopic(item)).length) {
			for (const word of item.vocabulary) {
				if (Object.keys(errors).some((key) => key.startsWith(`${word.id}.`)))
					expanded[word.id] = true;
			}
			await tick();
			formElement.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
			return;
		}
		saving = true;
		try {
			const saved = await saveKotobaAdminTopic(
				kotobaRepository,
				item,
				(value) => (progress = value)
			);
			kotoba.notice = `Topik “${saved.title}” berhasil disimpan.`;
			await goto(resolve('/admin/kotoba'), { invalidateAll: true });
		} catch (cause) {
			message = cause instanceof Error ? cause.message : 'Gagal menyimpan topik.';
			if (cause instanceof KotobaError) {
				serverErrors = kotobaAdminFieldErrors(cause, item);
				conflict = cause.status === 409;
				if (cause.status === 401) await goto(resolve('/signin'));
			}
			for (const word of item.vocabulary)
				if (Object.keys(serverErrors).some((key) => key.startsWith(`${word.id}.`)))
					expanded[word.id] = true;
		} finally {
			saving = false;
			progress = '';
		}
	}
</script>

<svelte:head>
	<title>
		{id === 'new' ? 'Buat Topik Kotoba' : `Edit ${item.title}`} | Admin - Gakkobit
	</title>
	<meta
		name="description"
		content="Kelola informasi topik, kosakata, cover, dan audio pengucapan."
	/>
</svelte:head>

{#snippet fieldError(field: string)}
	{#if errors[field]}<p id={`topic-${field}-error`} class="text-xs text-destructive" role="alert">
			{errors[field]}
		</p>{/if}
{/snippet}

<div class="admin-page">
	<Button
		variant="outline"
		size="icon"
		aria-label="Kembali ke daftar kotoba"
		onclick={() => goto(resolve('/admin/kotoba'))}
	>
		<ArrowLeft class="size-4" />
	</Button>
	<ManagementPageHeader
		title={id === 'new' ? 'Buat Topik Kotoba' : 'Edit Topik Kotoba'}
		description="Susun informasi topik dan kosakata beserta audio pengucapannya."
	/>
	<form bind:this={formElement} onsubmit={save} novalidate class="admin-page">
		{#if message}<div class="admin-notice border-destructive text-destructive" role="alert">
				{message}
				{#if conflict}<p class="mt-2">
						Isian belum disimpan. Muat ulang form untuk mengambil versi terbaru.
					</p>
					<Button variant="outline" onclick={() => window.location.reload()}>
						Muat ulang form
					</Button>{/if}
			</div>{/if}
		{#if saving}<p class="admin-notice" role="status">{progress}</p>{/if}
		<fieldset disabled={saving} class="contents">
			{#if submitted && Object.keys(errors).length}<p
					class="admin-notice border-destructive text-destructive"
					role="alert"
				>
					Periksa kembali kolom yang ditandai sebelum menyimpan.
				</p>{/if}
			<div class="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
				<div class="min-w-0 space-y-6">
					<Card.Root>
						<Card.Header>
							<Card.Title class="flex items-center gap-2">
								Informasi Topik
							</Card.Title><Card.Description>
								Isi informasi dasar topik kosakata yang akan dibuat.
							</Card.Description>
						</Card.Header>
						<Card.Content class="space-y-4">
							<div class="grid min-w-0 gap-4 sm:grid-cols-2">
								<div class="space-y-2">
									<label for="topic-title" class="text-sm font-medium">
										Nama Topik <span class="text-destructive">*</span>
									</label>
									<Input
										id="topic-title"
										bind:value={item.title}
										maxlength={160}
										required
										placeholder="Contoh: Sekolah"
										aria-invalid={Boolean(errors.title)}
										aria-describedby="topic-title-error"
									/>{@render fieldError('title')}
								</div>
								<div class="space-y-2">
									<label for="topic-level" class="text-sm font-medium">
										Level JLPT <span class="text-destructive">*</span>
									</label>
									<ManagementSelect
										id="topic-level"
										bind:value={item.level}
										options={kotobaLevels.map((value) => ({ value, label: value }))}
									/>
								</div>
								<div class="space-y-2">
									<label for="topic-category" class="text-sm font-medium">
										Label / Badge <span class="text-destructive">*</span>
									</label>
									<ManagementSelect
										id="topic-category"
										bind:value={item.category}
										options={['Dasar', 'Populer', 'Pemula'].map((value) => ({
											value,
											label: value
										}))}
									/>
								</div>
								<div class="space-y-2">
									<label for="topic-order" class="text-sm font-medium">
										Urutan Topik <span class="text-destructive">*</span>
									</label>
									<Input
										id="topic-order"
										type="number"
										min="1"
										step="1"
										bind:value={item.order}
										required
										aria-invalid={Boolean(errors.order)}
										aria-describedby="topic-order-error"
									/>{@render fieldError('order')}
								</div>
							</div>
							<div class="space-y-2">
								<label for="topic-description" class="text-sm font-medium">
									Deskripsi Topik <span class="text-destructive">*</span>
								</label>
								<Textarea
									id="topic-description"
									bind:value={item.description}
									maxlength={200}
									required
									placeholder="Jelaskan kosakata yang dipelajari dalam topik ini."
									aria-invalid={Boolean(errors.description)}
									aria-describedby="topic-description-error"
								/>
								<p class="text-right text-xs text-muted-foreground">
									{item.description.length}/200 karakter
								</p>
								{@render fieldError('description')}
							</div>
							<MediaInput
								kind="cover"
								id="topic-cover"
								label="Cover / Banner Gambar *"
								bind:value={item.cover}
								error={errors.cover}
							/>
						</Card.Content>
					</Card.Root>
					<Card.Root>
						<Card.Header>
							<Card.Title class="flex items-center gap-2">
								Daftar Kosakata <Badge variant="secondary">
									{item.vocabulary.length}
								</Badge>
							</Card.Title><Card.Description>
								Tambahkan kosakata, contoh kalimat, dan audio pengucapan.
							</Card.Description>
						</Card.Header>
						<Card.Content class="space-y-4">
							<p
								id="kotoba-reorder-instructions"
								class="text-xs leading-relaxed text-muted-foreground"
							>
								Geser melalui pegangan untuk mengubah urutan. Dengan keyboard: Space/Enter untuk
								mengangkat, panah untuk memindahkan, Enter untuk meletakkan, dan Escape untuk
								membatalkan.
							</p>
							{@render fieldError('vocabulary')}
							<div
								class="space-y-4"
								aria-label="Urutan kosakata"
								use:dragHandleZone={{
									items: words,
									type: 'admin-kotoba-vocabulary',
									flipDurationMs,
									dropFromOthersDisabled: true
								}}
								onconsider={consider}
								onfinalize={finalize}
							>
								{#each words as word, index (`${word.id}-${word[SHADOW_ITEM_MARKER_PROPERTY_NAME] ?? false}`)}
									<div
										animate:flip={{ duration: flipDurationMs }}
										data-word-id={word.id}
										data-is-dnd-shadow-item-hint={word[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
									>
										<VocabularyEditor
											bind:word={item.vocabulary[index]}
											number={index + 1}
											bind:open={
												() => expanded[word.id] ?? false, (value) => (expanded[word.id] = value)
											}
											{errors}
											{onPlay}
											dragDisabled={saving || words.length < 2}
											onDuplicate={() => addWord(word)}
											onRemove={() => item.vocabulary.splice(index, 1)}
										/>
									</div>
								{/each}
							</div>
							{#if !item.vocabulary.length}<p
									class="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground"
								>
									Belum ada kosakata. Tambahkan kosakata pertama untuk topik ini.
								</p>{/if}
							<Button
								variant="outline"
								class="w-full"
								onclick={() => addWord()}
								disabled={dragging}
							>
								Tambah Kosakata
							</Button>
						</Card.Content>
					</Card.Root>
				</div>
				<aside class="min-w-0 space-y-6 xl:sticky xl:top-6">
					<Card.Root>
						<Card.Header>
							<Card.Title class="flex items-center gap-2">
								Preview Ringkas
							</Card.Title><Card.Description>Pratinjau topik sesuai isian form.</Card.Description>
						</Card.Header>
						<Card.Content>
							<div class="overflow-hidden rounded-xl border" data-topic-preview>
								<Cover
									media={item.cover}
									class="aspect-[3/1] rounded-none"
									alt="Preview cover topik"
								/>
								<div class="space-y-3 p-4">
									<div class="flex items-center justify-between gap-2">
										<Badge>{item.level}</Badge><Badge variant="secondary">{item.category}</Badge>
									</div>
									<h2 class="text-xl font-semibold break-words">{item.title || 'Nama topik'}</h2>
									<p class="text-sm leading-relaxed break-words text-muted-foreground">
										{item.description || 'Deskripsi topik akan tampil di sini.'}
									</p>
									<p class="flex items-center gap-2 text-xs text-muted-foreground">
										{item.vocabulary.length} kosakata
									</p>
								</div>
							</div>
						</Card.Content>
					</Card.Root>
					<Card.Root>
						<Card.Header>
							<Card.Title class="flex items-center gap-2">
								Pengaturan Publikasi
							</Card.Title><Card.Description>Atur status dan tampilan topik.</Card.Description>
						</Card.Header>
						<Card.Content class="space-y-4">
							<div class="flex items-start gap-3">
								<Checkbox id="topic-active" bind:checked={item.active} class="mt-1" />
								<div>
									<label for="topic-active" class="text-sm font-medium">Aktif</label>
									<p class="mt-1 text-xs leading-relaxed text-muted-foreground">
										Siswa dapat mengakses topik yang aktif.
									</p>
								</div>
							</div>
							<div class="flex items-start gap-3">
								<Checkbox id="topic-visible" bind:checked={item.visible} class="mt-1" />
								<div>
									<label for="topic-visible" class="text-sm font-medium">
										Tampilkan di halaman siswa
									</label>
									<p class="mt-1 text-xs leading-relaxed text-muted-foreground">
										Tampilkan topik dalam daftar topik siswa.
									</p>
								</div>
							</div>
						</Card.Content>
					</Card.Root>
					<div class="flex flex-wrap justify-end gap-3">
						<Button variant="outline" onclick={() => goto(resolve('/admin/kotoba'))}>Batal</Button>
						<Button type="submit" disabled={dragging || saving}>
							{saving ? 'Menyimpan...' : 'Simpan'}
						</Button>
					</div>
				</aside>
			</div>
		</fieldset>
	</form>
</div>
