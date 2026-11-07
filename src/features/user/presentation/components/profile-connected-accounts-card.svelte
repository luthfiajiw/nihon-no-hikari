<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { CheckCircle2 } from 'lucide-svelte';
	import googleLogo from '$lib/assets/images/google-logo.png';

	interface Props {
		googleLinked: boolean;
	}

	let { googleLinked }: Props = $props();
</script>

<Card.Root class="p-6">
	<Card.Header class="px-0 pt-0">
		<Card.Title class="text-lg font-bold">Akun Terhubung</Card.Title>
		<Card.Description>
			Layanan pihak ketiga yang ditautkan ke akun Nihon No Hikari Anda.
		</Card.Description>
	</Card.Header>

	<Card.Content class="px-0">
		<div class="divide-y divide-border">
			<div class="flex items-center justify-between py-3">
				<div class="flex items-center gap-3">
					<div
						class="flex size-10 items-center justify-center rounded-lg border bg-white p-2 dark:border-border dark:bg-card"
					>
						<img src={googleLogo} alt="Google" class="size-5 object-contain" />
					</div>
					<div>
						<p class="text-sm font-semibold text-foreground">Google</p>
						<p class="text-xs text-muted-foreground">
							{googleLinked
								? 'Akun Google Anda terhubung dan dapat digunakan untuk masuk.'
								: 'Tautkan akun Google untuk mempermudah proses masuk.'}
						</p>
					</div>
				</div>

				<div>
					{#if googleLinked}
						<Badge
							variant="outline"
							class="gap-1 border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
						>
							<CheckCircle2 class="size-3.5" />
							Terhubung
						</Badge>
					{:else}
						<Badge variant="secondary">Belum Terhubung</Badge>
					{/if}
				</div>
			</div>
		</div>
	</Card.Content>
</Card.Root>
