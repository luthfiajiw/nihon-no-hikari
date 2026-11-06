<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Check } from 'lucide-svelte';

	export interface AvatarPreset {
		id: string;
		name: string;
		url: string;
		description: string;
	}

	export const AVATAR_PRESETS: AvatarPreset[] = [
		{
			id: 'default',
			name: 'Gakkobit Mascot',
			url: 'https://gcwjewiszjevcgonvhld.supabase.co/storage/v1/object/public/public-avatars/gakkobit-default-ava.jpg',
			description: 'Maskot resmi Gakkobit'
		},
		{
			id: 'kitsune',
			name: 'Kitsune',
			url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Kitsune',
			description: 'Rubah mistis Jepang'
		},
		{
			id: 'tanuki',
			name: 'Tanuki',
			url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Tanuki',
			description: 'Semangat belajar tekun'
		},
		{
			id: 'samurai',
			name: 'Samurai',
			url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Samurai',
			description: 'Disiplin dan pantang menyerah'
		},
		{
			id: 'ninja',
			name: 'Shinobi',
			url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Shinobi',
			description: 'Cepat dan tangkas'
		},
		{
			id: 'sakura',
			name: 'Sakura',
			url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sakura',
			description: 'Mekar dan penuh inspirasi'
		},
		{
			id: 'sensei',
			name: 'Sensei',
			url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sensei',
			description: 'Bijaksana dan membimbing'
		},
		{
			id: 'daruma',
			name: 'Daruma',
			url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Daruma',
			description: 'Simbol tekad dan pencapaian target'
		}
	];

	interface Props {
		open: boolean;
		currentAvatarUrl?: string | null;
		onSelect: (url: string) => void;
	}

	let { open = $bindable(false), currentAvatarUrl = null, onSelect }: Props = $props();

	let selectedUrl = $state(AVATAR_PRESETS[0].url);

	$effect(() => {
		if (open) {
			selectedUrl = currentAvatarUrl || AVATAR_PRESETS[0].url;
		}
	});

	function handleConfirm() {
		onSelect(selectedUrl);
		open = false;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-md sm:max-w-lg">
		<Dialog.Header>
			<Dialog.Title class="text-xl font-bold">Pilih Avatar Profil</Dialog.Title>
			<Dialog.Description>
				Pilih salah satu karakter maskot atau tema Jepang untuk menjadi avatar profil Anda.
			</Dialog.Description>
		</Dialog.Header>

		<div class="grid grid-cols-2 gap-3 py-4 sm:grid-cols-4">
			{#each AVATAR_PRESETS as preset (preset.id)}
				{@const isSelected = selectedUrl === preset.url}
				<button
					type="button"
					class="relative flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-center transition-all hover:bg-neutral-50 dark:hover:bg-neutral-800/50 {isSelected
						? 'border-primary bg-primary/5 ring-2 ring-primary/20'
						: 'border-transparent bg-neutral-100/70 dark:bg-neutral-800/20'}"
					onclick={() => (selectedUrl = preset.url)}
				>
					<Avatar.Root class="size-16 rounded-full border border-neutral-200 dark:border-neutral-700">
						<Avatar.Image src={preset.url} alt={preset.name} />
						<Avatar.Fallback>{preset.name.charAt(0)}</Avatar.Fallback>
					</Avatar.Root>
					<div class="min-w-0">
						<p class="text-xs font-semibold text-neutral-900 dark:text-neutral-100">{preset.name}</p>
						<p class="truncate text-[10px] text-neutral-500">{preset.description}</p>
					</div>
					{#if isSelected}
						<div
							class="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-primary text-white"
						>
							<Check class="size-3" />
						</div>
					{/if}
				</button>
			{/each}
		</div>

		<Dialog.Footer class="flex items-center justify-end gap-2">
			<Button variant="outline" onclick={() => (open = false)}>Batal</Button>
			<Button onclick={handleConfirm}>Gunakan Avatar Ini</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
