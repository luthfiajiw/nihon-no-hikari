<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { CheckCircle2, Link2, Unlink } from 'lucide-svelte';
	import googleLogo from '$lib/assets/images/google-logo.png';
	import ProfileGoogleLinkDialog from './profile-google-link-dialog.svelte';
	import ProfileGoogleUnlinkDialog from './profile-google-unlink-dialog.svelte';

	interface Props {
		googleLinked: boolean;
		hasPassword: boolean;
		email: string;
		googleEmail?: string | null;
	}

	let { googleLinked, hasPassword, email, googleEmail }: Props = $props();

	let linkDialogOpen = $state(false);
	let unlinkDialogOpen = $state(false);

	let connectedGoogleEmail = $derived(googleEmail || (googleLinked ? email : ''));
</script>

<Card.Root class="p-6">
	<Card.Header class="px-0 pt-0">
		<Card.Title class="text-lg font-bold">Akun Terhubung</Card.Title>
		<Card.Description>
			Layanan pihak ketiga yang ditautkan ke akun Gakkobit Anda.
		</Card.Description>
	</Card.Header>

	<Card.Content class="px-0">
		<div class="divide-y divide-border">
			<div class="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
				<div class="flex items-center gap-3">
					<div
						class="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-white p-2 dark:border-border dark:bg-card"
					>
						<img src={googleLogo} alt="Google" class="size-5 object-contain" />
					</div>
					<div class="space-y-0.5">
						<p class="text-sm font-semibold text-foreground">Google</p>
						{#if googleLinked && connectedGoogleEmail}
							<p class="text-xs font-medium text-foreground break-all">
								{connectedGoogleEmail}
							</p>
						{/if}
						<p class="text-xs text-muted-foreground">
							{googleLinked
								? 'Akun Google Anda terhubung dan dapat digunakan untuk masuk.'
								: 'Tautkan akun Google untuk mempermudah proses masuk.'}
						</p>
						{#if googleLinked && !hasPassword}
							<p class="pt-0.5 text-xs text-amber-600 dark:text-amber-400">
								Buat kata sandi akun terlebih dahulu pada formulir di atas sebelum memutuskan tautan Google.
							</p>
						{/if}
					</div>
				</div>

				<div class="flex items-center gap-2.5 self-end sm:self-auto">
					{#if googleLinked}
						<Badge
							variant="outline"
							class="gap-1 border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
						>
							<CheckCircle2 class="size-3.5" />
							Terhubung
						</Badge>
						<Button
							variant="outline"
							size="sm"
							class="h-8 gap-1.5 text-xs font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
							disabled={!hasPassword}
							title={!hasPassword ? 'Buat kata sandi akun terlebih dahulu untuk memutuskan tautan' : 'Putuskan tautan akun Google'}
							onclick={() => (unlinkDialogOpen = true)}
						>
							<Unlink class="size-3.5" />
							Putuskan
						</Button>
					{:else}
						<Badge variant="secondary">Belum Terhubung</Badge>
						<Button
							variant="outline"
							size="sm"
							class="h-8 gap-1.5 text-xs font-medium"
							onclick={() => (linkDialogOpen = true)}
						>
							<Link2 class="size-3.5" />
							Tautkan
						</Button>
					{/if}
				</div>
			</div>
		</div>
	</Card.Content>
</Card.Root>

<ProfileGoogleLinkDialog
	bind:open={linkDialogOpen}
	{email}
/>

<ProfileGoogleUnlinkDialog
	bind:open={unlinkDialogOpen}
	googleEmail={connectedGoogleEmail}
/>
