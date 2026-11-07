<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Field from '$lib/components/ui/field/index.js';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Lock, LoaderCircle, Check } from 'lucide-svelte';

	interface Props {
		hasPassword: boolean;
	}

	let { hasPassword }: Props = $props();

	let isChangingPassword = $state(false);
</script>

<Card.Root class="p-6">
	<Card.Header class="px-0 pt-0">
		<Card.Title class="text-lg font-bold">
			{hasPassword ? 'Ubah Kata Sandi' : 'Buat Kata Sandi Akun'}
		</Card.Title>
		<Card.Description>
			{#if hasPassword}
				Pastikan akun Anda menggunakan kata sandi yang kuat dan unik minimal 8 karakter.
			{:else}
				Akun Anda terdaftar melalui Google OAuth. Anda dapat membuat kata sandi baru untuk
				mengaktifkan login langsung dengan email dan kata sandi.
			{/if}
		</Card.Description>
	</Card.Header>

	<Card.Content class="px-0">
		{#if !hasPassword}
			<div
				class="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300"
			>
				<p class="font-semibold">💡 Info Akun Google</p>
				<p class="mt-1">
					Anda saat ini masuk menggunakan Google. Menambahkan kata sandi memungkinkan Anda masuk
					dengan dua opsi (Google OAuth maupun Email & Password).
				</p>
			</div>
		{/if}

		<form
			method="POST"
			action="?/changePassword"
			use:enhance={() => {
				isChangingPassword = true;
				return async ({ update }) => {
					isChangingPassword = false;
					await update();
				};
			}}
			class="flex max-w-lg flex-col gap-4"
		>
			<Field.FieldGroup class="gap-4">
				{#if hasPassword}
					<Field.Field>
						<Field.FieldLabel
							for="current_password"
							class="text-xs font-bold tracking-wider uppercase"
						>
							Kata Sandi Saat Ini
						</Field.FieldLabel>
						<InputGroup.Root>
							<InputGroup.Input
								id="current_password"
								name="current_password"
								type="password"
								required
								placeholder="••••••••"
							/>
							<InputGroup.Addon align="inline-end">
								<Lock class="size-4 text-muted-foreground" />
							</InputGroup.Addon>
						</InputGroup.Root>
					</Field.Field>
				{/if}

				<Field.Field>
					<Field.FieldLabel for="new_password" class="text-xs font-bold tracking-wider uppercase">
						Kata Sandi Baru
					</Field.FieldLabel>
					<InputGroup.Root>
						<InputGroup.Input
							id="new_password"
							name="new_password"
							type="password"
							required
							minlength={8}
							placeholder="Minimal 8 karakter"
						/>
						<InputGroup.Addon align="inline-end">
							<Lock class="size-4 text-muted-foreground" />
						</InputGroup.Addon>
					</InputGroup.Root>
				</Field.Field>

				<Field.Field>
					<Field.FieldLabel
						for="confirm_password"
						class="text-xs font-bold tracking-wider uppercase"
					>
						Konfirmasi Kata Sandi Baru
					</Field.FieldLabel>
					<InputGroup.Root>
						<InputGroup.Input
							id="confirm_password"
							name="confirm_password"
							type="password"
							required
							minlength={8}
							placeholder="Ulangi kata sandi baru"
						/>
						<InputGroup.Addon align="inline-end">
							<Lock class="size-4 text-muted-foreground" />
						</InputGroup.Addon>
					</InputGroup.Root>
				</Field.Field>
			</Field.FieldGroup>

			<div class="pt-2">
				<Button type="submit" disabled={isChangingPassword} class="gap-2">
					{#if isChangingPassword}
						<LoaderCircle class="animate-spin" data-icon="inline-start" />
						Memperbarui…
					{:else}
						<Check data-icon="inline-start" />
						{hasPassword ? 'Perbarui Kata Sandi' : 'Buat Kata Sandi'}
					{/if}
				</Button>
			</div>
		</form>
	</Card.Content>
</Card.Root>
