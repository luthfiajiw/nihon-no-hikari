<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { deserialize } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Field from '$lib/components/ui/field/index.js';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Lock, AlertCircleIcon, Unlink } from 'lucide-svelte';

	interface Props {
		open: boolean;
		googleEmail?: string | null;
		onSuccess?: () => void;
	}

	let { open = $bindable(false), googleEmail, onSuccess }: Props = $props();

	let currentPassword = $state('');
	let isLoading = $state(false);
	let errorMessage = $state<string | null>(null);

	$effect(() => {
		if (!open) {
			currentPassword = '';
			isLoading = false;
			errorMessage = null;
		}
	});

	async function handleUnlink() {
		if (isLoading) return;
		const trimmed = currentPassword.trim();
		if (!trimmed) {
			errorMessage = 'Kata sandi saat ini harus diisi.';
			return;
		}
		errorMessage = null;
		isLoading = true;
		try {
			const formData = new FormData();
			formData.append('current_password', trimmed);
			const res = await fetch('?/unlinkGoogle', {
				method: 'POST',
				body: formData
			});
			const result: ActionResult = deserialize(await res.text());
			if (result.type === 'success') {
				await invalidateAll();
				open = false;
				onSuccess?.();
			} else if (result.type === 'failure') {
				errorMessage = (result.data?.error as string) || 'Gagal memutuskan tautan akun Google.';
			} else {
				errorMessage = 'Terjadi kesalahan sistem saat memutuskan tautan.';
			}
		} catch {
			errorMessage = 'Gagal terhubung ke server.';
		} finally {
			isLoading = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2 text-lg font-bold text-destructive">
				Putuskan Tautan Akun Google
			</Dialog.Title>
			<Dialog.Description class="text-sm text-muted-foreground">
				{#if googleEmail}
					Setelah tautan akun Google (<span class="font-medium text-foreground">{googleEmail}</span>) diputuskan, Anda tidak dapat lagi masuk menggunakan akun tersebut sampai Anda menautkannya kembali.
				{:else}
					Setelah tautan diputuskan, Anda tidak dapat lagi masuk menggunakan akun Google ini sampai Anda menautkannya kembali.
				{/if}
				Anda tetap dapat masuk menggunakan email dan kata sandi akun Anda.
			</Dialog.Description>
		</Dialog.Header>

		{#if errorMessage}
			<div
				class="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-2.5 text-xs text-destructive"
				role="alert"
			>
				<AlertCircleIcon class="mt-0.5 size-4 shrink-0" />
				<p class="leading-relaxed">{errorMessage}</p>
			</div>
		{/if}

		<form
			onsubmit={(e) => {
				e.preventDefault();
				handleUnlink();
			}}
			class="flex flex-col gap-4 py-2"
		>
			<Field.Field>
				<Field.FieldLabel for="unlink_current_password" class="text-sm font-medium">
					Konfirmasi Kata Sandi Saat Ini
				</Field.FieldLabel>
				<InputGroup.Root>
					<InputGroup.Input
						id="unlink_current_password"
						name="current_password"
						type="password"
						autocomplete="current-password"
						required
						disabled={isLoading}
						bind:value={currentPassword}
						placeholder="Masukkan kata sandi akun Anda"
					/>
					<InputGroup.Addon align="inline-end">
						<Lock class="size-4 text-muted-foreground" />
					</InputGroup.Addon>
				</InputGroup.Root>
			</Field.Field>

			<Dialog.Footer class="mt-2 flex flex-row justify-end gap-2 sm:justify-end">
				<Button type="button" variant="ghost" disabled={isLoading} onclick={() => (open = false)}>
					Batal
				</Button>
				<Button
					type="submit"
					variant="destructive"
					disabled={isLoading || !currentPassword.trim()}
					{isLoading}
					class="gap-2"
				>
					{#if !isLoading}
						<Unlink class="size-4" />
					{/if}
					Putuskan Tautan
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
