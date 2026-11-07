<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Field from '$lib/components/ui/field/index.js';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Pencil, CheckCircle2, Lock, LoaderCircle, Check } from 'lucide-svelte';
	import type { UserProfileData } from '../../domain/entities/user-profile.entity';

	interface Props {
		profile: UserProfileData;
		currentAvatar: string;
		onResetAvatar?: () => void;
	}

	let { profile, currentAvatar, onResetAvatar }: Props = $props();

	let displayNameInput = $derived(profile.display_name || '');
	let isUpdatingProfile = $state(false);

	function handleResetForm() {
		displayNameInput = profile.display_name || '';
		onResetAvatar?.();
	}
</script>

<Card.Root class="p-6">
	<Card.Header class="px-0 pt-0">
		<Card.Title class="text-lg font-bold">Informasi Akun</Card.Title>
		<Card.Description>
			Perbarui nama tampilan yang akan dilihat oleh pengguna lain, sensei mentor, dan tercetak di
			lembar tugas.
		</Card.Description>
	</Card.Header>

	<Card.Content class="px-0">
		<form
			method="POST"
			action="?/updateProfile"
			use:enhance={() => {
				isUpdatingProfile = true;
				return async ({ update }) => {
					isUpdatingProfile = false;
					await update();
				};
			}}
			class="flex flex-col gap-5"
		>
			<!-- Hidden Avatar Input -->
			<input type="hidden" name="avatar_url" value={currentAvatar} />

			<Field.FieldGroup class="gap-4">
				<!-- Input: Nama Tampilan -->
				<Field.Field>
					<div class="flex items-center justify-between">
						<Field.FieldLabel for="display_name" class="text-xs font-bold tracking-wider uppercase">
							Nama Tampilan <span class="text-destructive">*</span>
						</Field.FieldLabel>
						<span class="text-[11px] text-muted-foreground">Maks. 120 Karakter</span>
					</div>
					<InputGroup.Root>
						<InputGroup.Input
							id="display_name"
							name="display_name"
							type="text"
							required
							maxlength={120}
							bind:value={displayNameInput}
							placeholder="Masukkan nama lengkap / panggilan Anda"
						/>
						<InputGroup.Addon align="inline-end">
							<Pencil class="size-4 text-muted-foreground" />
						</InputGroup.Addon>
					</InputGroup.Root>
					<Field.FieldDescription class="text-[11px]">
						Nama ini akan ditampilkan pada sertifikat kelulusan materi, forum komunitas, dan header
						aplikasi.
					</Field.FieldDescription>
				</Field.Field>

				<!-- Input: Alamat Email (Managed / Read-only) -->
				<Field.Field>
					<div class="flex items-center justify-between">
						<Field.FieldLabel
							for="account_email"
							class="text-xs font-bold tracking-wider uppercase"
						>
							Alamat Email
						</Field.FieldLabel>
						<Badge
							variant="outline"
							class="gap-1 border-emerald-300 bg-emerald-50 text-[11px] font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
						>
							<CheckCircle2 class="size-3 text-emerald-600 dark:text-emerald-400" />
							Terverifikasi
						</Badge>
					</div>
					<InputGroup.Root class="bg-muted/40">
						<InputGroup.Input
							id="account_email"
							type="email"
							readonly
							disabled
							value={profile.email}
							class="cursor-not-allowed text-muted-foreground select-all"
						/>
						<InputGroup.Addon align="inline-end" title="Identitas login terverifikasi">
							<Lock class="size-4 text-muted-foreground" />
						</InputGroup.Addon>
					</InputGroup.Root>
					<Field.FieldDescription class="text-[11px]">
						Email merupakan identitas login unik dan ditautkan dengan autentikasi akun Anda sehingga
						tidak dapat diubah manual.
					</Field.FieldDescription>
				</Field.Field>
			</Field.FieldGroup>

			<!-- Form Action Bar -->
			<div class="flex items-center justify-between border-t pt-4">
				<span class="hidden text-xs text-muted-foreground sm:inline">
					Perubahan langsung aktif di sesi Anda
				</span>
				<div class="flex w-full items-center justify-end gap-3 sm:w-auto">
					<Button
						type="button"
						variant="outline"
						onclick={handleResetForm}
						disabled={isUpdatingProfile}
					>
						Batal
					</Button>
					<Button type="submit" disabled={isUpdatingProfile} class="gap-2">
						{#if isUpdatingProfile}
							<LoaderCircle class="animate-spin" data-icon="inline-start" />
							Menyimpan…
						{:else}
							<Check data-icon="inline-start" />
							Simpan Perubahan
						{/if}
					</Button>
				</div>
			</div>
		</form>
	</Card.Content>
</Card.Root>
