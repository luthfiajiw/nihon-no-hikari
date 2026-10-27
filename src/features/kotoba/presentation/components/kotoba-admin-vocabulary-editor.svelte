<script lang="ts">
	import { ChevronDown, ChevronUp, Copy, GripVertical, Plus, Trash2 } from 'lucide-svelte';
	import { dragHandle } from 'svelte-dnd-action';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { kotobaTypes } from '$features/kotoba/data/kotoba-topic-detail';
	import ManagementSelect from '$lib/components/management-select.svelte';
	import MediaInput from '$features/kotoba/presentation/components/kotoba-admin-media-input.svelte';
	import {
		kotobaAdminWholeWordFurigana,
		type KotobaAdminVocabulary,
		type KotobaAdminErrors
	} from '$features/kotoba/presentation/models/kotoba-admin.model';

	let {
		word = $bindable(),
		number,
		open = $bindable(true),
		errors,
		onDuplicate,
		onRemove,
		onPlay,
		dragDisabled = false
	}: {
		word: KotobaAdminVocabulary;
		number: number;
		open?: boolean;
		errors: KotobaAdminErrors;
		onDuplicate: () => void;
		onRemove: () => void;
		onPlay: (audio: HTMLAudioElement) => void;
		dragDisabled?: boolean;
	} = $props();
	const uid = $props.id();
	let showFurigana = $state(false);
	const hasErrors = $derived(Object.keys(errors).some((key) => key.startsWith(`${word.id}.`)));
	const previewFurigana = $derived(
		word.furigana.length ? word.furigana : kotobaAdminWholeWordFurigana(word)
	);
	function updateJapanese(field: 'kanji' | 'hiragana', value: string) {
		const whole =
			!word.furigana.length || (word.furigana.length === 1 && word.furigana[0].text === word.kanji);
		word[field] = value;
		if (whole) word.furigana = kotobaAdminWholeWordFurigana(word);
	}
</script>

{#snippet fieldError(field: string)}
	{#if errors[`${word.id}.${field}`]}
		<p id={`${uid}-${field}-error`} class="text-xs text-destructive" role="alert">
			{errors[`${word.id}.${field}`]}
		</p>
	{/if}
{/snippet}

<section
	class="min-w-0 overflow-hidden rounded-xl border bg-background {hasErrors
		? 'border-destructive'
		: 'border-border'}"
	aria-labelledby={`${uid}-heading`}
>
	<div class="flex flex-wrap items-center gap-2 bg-muted/50 p-3 sm:px-4">
		<span
			role="button"
			tabindex="0"
			use:dragHandle
			inert={dragDisabled}
			aria-disabled={dragDisabled}
			data-sort-handle
			aria-label={`Geser kosakata ${number}`}
			aria-describedby="kotoba-reorder-instructions"
			onclick={(event) => event.preventDefault()}
			onkeydown={(event) => {
				if (event.key === ' ' || event.key === 'Enter') event.preventDefault();
			}}
			class="flex size-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring aria-disabled:opacity-40"
		>
			<GripVertical class="size-4" />
		</span>
		<span
			class="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary"
		>
			{number}
		</span>
		<h3 id={`${uid}-heading`} class="min-w-0 flex-1 truncate text-sm font-semibold">
			{word.romaji || `Kosakata ${number}`}
		</h3>
		<div class="flex shrink-0 gap-1">
			<Button
				variant="ghost"
				size="icon-sm"
				aria-label={`Duplikat kosakata ${number}`}
				onclick={onDuplicate}
			>
				<Copy class="size-4" />
			</Button>
			<Button
				variant="ghost"
				size="icon-sm"
				aria-label={`Hapus kosakata ${number}`}
				onclick={onRemove}
			>
				<Trash2 class="size-4 text-destructive" />
			</Button>
			<Button
				variant="ghost"
				size="icon-sm"
				aria-label={`${open ? 'Ciutkan' : 'Buka'} kosakata ${number}`}
				aria-expanded={open}
				aria-controls={`${uid}-body`}
				onclick={() => (open = !open)}
			>
				{#if open}<ChevronUp class="size-4" />{:else}<ChevronDown class="size-4" />{/if}
			</Button>
		</div>
	</div>
	<!-- Keep media mounted while collapsed, so playback and selected files stay stable. -->
	<div id={`${uid}-body`} hidden={!open} class="space-y-4 p-4">
		<div class="grid min-w-0 gap-4 sm:grid-cols-2">
			<div class="min-w-0 space-y-2">
				<label for={`${uid}-kanji`} class="text-sm font-medium">
					Kata Jepang (Kanji / Kana) <span class="text-destructive">*</span>
				</label>
				<Input
					id={`${uid}-kanji`}
					value={word.kanji}
					oninput={(event) => updateJapanese('kanji', event.currentTarget.value)}
					placeholder="学校"
					lang="ja"
					required
					aria-invalid={Boolean(errors[`${word.id}.kanji`])}
					aria-describedby={`${uid}-kanji-error`}
				/>
				{@render fieldError('kanji')}
			</div>
			<div class="min-w-0 space-y-2">
				<label for={`${uid}-hiragana`} class="text-sm font-medium">
					Hiragana / Kana <span class="text-destructive">*</span>
				</label>
				<Input
					id={`${uid}-hiragana`}
					value={word.hiragana}
					oninput={(event) => updateJapanese('hiragana', event.currentTarget.value)}
					placeholder="がっこう"
					lang="ja"
					required
					aria-invalid={Boolean(errors[`${word.id}.hiragana`])}
					aria-describedby={`${uid}-hiragana-error`}
				/>
				{@render fieldError('hiragana')}
			</div>
			<div class="min-w-0 space-y-2">
				<label for={`${uid}-romaji`} class="text-sm font-medium">
					Romaji <span class="text-destructive">*</span>
				</label>
				<Input
					id={`${uid}-romaji`}
					bind:value={word.romaji}
					placeholder="gakkou"
					required
					aria-invalid={Boolean(errors[`${word.id}.romaji`])}
					aria-describedby={`${uid}-romaji-error`}
				/>
				{@render fieldError('romaji')}
			</div>
			<div class="min-w-0 space-y-2">
				<label for={`${uid}-translation`} class="text-sm font-medium">
					Arti Indonesia <span class="text-destructive">*</span>
				</label>
				<Input
					id={`${uid}-translation`}
					bind:value={word.translation}
					placeholder="sekolah"
					required
					aria-invalid={Boolean(errors[`${word.id}.translation`])}
					aria-describedby={`${uid}-translation-error`}
				/>
				{@render fieldError('translation')}
			</div>
		</div>
		<div class="space-y-2">
			<label for={`${uid}-type`} class="text-sm font-medium">
				Kelas Kata <span class="text-destructive">*</span>
			</label>
			<ManagementSelect
				id={`${uid}-type`}
				bind:value={word.type}
				options={kotobaTypes.map((value) => ({ value, label: value }))}
			/>
		</div>
		<div class="grid min-w-0 gap-4 sm:grid-cols-2">
			<div class="min-w-0 space-y-2">
				<label for={`${uid}-japanese`} class="text-sm font-medium">
					Contoh Kalimat Jepang <span class="text-destructive">*</span>
				</label>
				<Textarea
					id={`${uid}-japanese`}
					bind:value={word.example.japanese}
					placeholder="わたしは毎日学校へ行きます。"
					lang="ja"
					required
					aria-invalid={Boolean(errors[`${word.id}.japanese`])}
					aria-describedby={`${uid}-japanese-error`}
				/>
				{@render fieldError('japanese')}
			</div>
			<div class="min-w-0 space-y-2">
				<label for={`${uid}-indonesian`} class="text-sm font-medium">
					Terjemahan Indonesia <span class="text-destructive">*</span>
				</label>
				<Textarea
					id={`${uid}-indonesian`}
					bind:value={word.example.indonesian}
					placeholder="Saya pergi ke sekolah setiap hari."
					required
					aria-invalid={Boolean(errors[`${word.id}.indonesian`])}
					aria-describedby={`${uid}-indonesian-error`}
				/>
				{@render fieldError('indonesian')}
			</div>
		</div>
		<MediaInput
			kind="audio"
			id={`${uid}-audio`}
			label={`Audio kosakata ${number}`}
			bind:value={word.audio}
			{onPlay}
		/>
		<div class="space-y-3 rounded-xl border border-dashed p-3">
			<div class="flex flex-wrap items-center justify-between gap-3">
				<div class="min-w-0">
					<p class="text-xs font-medium text-muted-foreground">Preview furigana</p>
					<p class="pt-3 text-2xl leading-loose font-semibold" lang="ja" data-furigana-preview>
						{#each previewFurigana as part, index (index)}{#if part.reading}<ruby>
									{part.text}
									<rp>(</rp>
									<rt class="text-xs font-normal">{part.reading}</rt>
									<rp>)</rp>
								</ruby>{:else}{part.text}{/if}{/each}
						{#if !word.kanji}<span class="text-base font-normal text-muted-foreground">
								Kata Jepang akan tampil di sini
							</span>{/if}
					</p>
				</div>
				<Button
					variant="ghost"
					size="sm"
					aria-expanded={showFurigana}
					aria-controls={`${uid}-furigana`}
					onclick={() => {
						showFurigana = !showFurigana;
						if (showFurigana && !word.furigana.length)
							word.furigana = kotobaAdminWholeWordFurigana(word);
					}}
				>
					{showFurigana ? 'Tutup' : 'Atur'} Furigana <ChevronDown class="size-3.5" />
				</Button>
			</div>
			{@render fieldError('furigana')}
			{#if showFurigana}
				<div id={`${uid}-furigana`} class="space-y-3 border-t pt-3">
					<p class="text-xs leading-relaxed text-muted-foreground">
						Pisahkan kanji dan kana bila perlu. Contoh 読む: teks 読 dengan bacaan よ, lalu teks む
						tanpa bacaan.
					</p>
					{#each word.furigana as part, index (index)}
						<div class="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-end gap-2">
							<div class="min-w-0 space-y-2">
								<label for={`${uid}-segment-${index}`} class="text-xs font-medium">
									Teks {index + 1}
								</label>
								<Input id={`${uid}-segment-${index}`} bind:value={part.text} lang="ja" />
							</div>
							<div class="min-w-0 space-y-2">
								<label for={`${uid}-reading-${index}`} class="text-xs font-medium">
									Bacaan {index + 1}
								</label>
								<Input
									id={`${uid}-reading-${index}`}
									bind:value={part.reading}
									placeholder="Opsional"
									lang="ja"
								/>
							</div>
							<Button
								variant="ghost"
								size="icon-sm"
								aria-label={`Hapus segmen ${index + 1}`}
								onclick={() => word.furigana.splice(index, 1)}
							>
								<Trash2 class="size-3.5" />
							</Button>
						</div>
					{/each}
					<div class="flex flex-wrap gap-2">
						<Button
							variant="outline"
							size="sm"
							onclick={() => word.furigana.push({ text: '', reading: '' })}
						>
							<Plus class="size-3.5" />Tambah segmen
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onclick={() => (word.furigana = kotobaAdminWholeWordFurigana(word))}
						>
							Gunakan bacaan utuh
						</Button>
					</div>
				</div>
			{/if}
		</div>
	</div>
</section>
