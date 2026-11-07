<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Camera, Sparkles } from 'lucide-svelte';
	import type { UserProfileData } from '../../domain/entities/user-profile.entity';
	import googleLogo from '$lib/assets/images/google-logo.png';

	interface Props {
		profile: UserProfileData;
		currentAvatar: string;
		defaultAvatar: string;
		onOpenAvatarDialog: () => void;
		onResetAvatar: () => void;
	}

	let { profile, currentAvatar, defaultAvatar, onOpenAvatarDialog, onResetAvatar }: Props =
		$props();
</script>

<Card.Root class="p-6 text-center">
	<Card.Content class="flex flex-col items-center p-0">
		<!-- Single Avatar Container -->
		<div class="relative mt-2 mb-4">
			<Avatar.Root
				class="size-28 overflow-hidden rounded-full border-2 border-border shadow-sm md:size-28"
			>
				<Avatar.Image src={currentAvatar || defaultAvatar} alt={profile.display_name} />
				<Avatar.Fallback class="bg-muted text-2xl font-bold text-foreground">
					{profile.display_name?.charAt(0)?.toUpperCase() ?? 'U'}
				</Avatar.Fallback>
			</Avatar.Root>

			<!-- Camera change trigger button -->
			<Button
				type="button"
				size="icon"
				class="absolute right-0 bottom-0 size-8 rounded-full border-2 border-background shadow-sm transition-transform hover:scale-105 active:scale-95"
				onclick={onOpenAvatarDialog}
				title="Ubah Foto Profil"
			>
				<Camera class="size-4" />
			</Button>
		</div>

		<!-- User Names & Email preview -->
		<h2 class="text-xl font-bold tracking-tight text-foreground">
			{profile.display_name}
		</h2>
		<p class="mt-0.5 text-xs break-all text-muted-foreground">
			{profile.email}
		</p>

		<!-- Status Pill Badges -->
		<div class="mt-3 mb-5 flex flex-wrap items-center justify-center gap-2">
			<Badge variant="secondary" class="gap-1.5 px-3 py-1 font-medium">
				<span class="size-2 rounded-full bg-emerald-500"></span>
				{profile.role === 'Admin' ? 'Admin' : 'User Pelajar'}
			</Badge>

			{#if profile.google_linked}
				<Badge variant="outline" class="gap-1.5 px-2.5 py-1 text-xs">
					<img src={googleLogo} alt="Google" class="size-3.5 object-contain" />
					Google
				</Badge>
			{/if}
		</div>

		<!-- Avatar Action Buttons -->
		<div class="flex w-full flex-col gap-2 border-t pt-3">
			<Button
				variant="outline"
				class="w-full gap-2 text-xs font-semibold"
				onclick={onOpenAvatarDialog}
			>
				<Sparkles data-icon="inline-start" />
				Pilih Preset Avatar Karakter
			</Button>

			{#if currentAvatar && currentAvatar !== defaultAvatar}
				<Button
					variant="ghost"
					class="w-full text-xs text-muted-foreground hover:text-foreground"
					onclick={onResetAvatar}
				>
					Gunakan Avatar Default
				</Button>
			{/if}
		</div>
	</Card.Content>
</Card.Root>
