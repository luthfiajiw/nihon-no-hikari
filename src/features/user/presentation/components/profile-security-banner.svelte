<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { ShieldCheck } from 'lucide-svelte';

	interface Props {
		sessionsCount: number;
		onManageSessions: () => void;
	}

	let { sessionsCount, onManageSessions }: Props = $props();
</script>

<Card.Root class="p-5">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div class="flex items-center gap-3.5">
			<div
				class="flex size-10 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
			>
				<ShieldCheck class="size-5" />
			</div>
			<div class="flex flex-col">
				<h4 class="text-sm font-bold text-foreground">Perlindungan Akun & Autentikasi 2 Langkah</h4>
				<p class="text-xs text-muted-foreground">
					Akun Anda dilindungi dengan enkripsi SSL 256-bit dan autentikasi terverifikasi Google.
				</p>
			</div>
		</div>

		<div class="flex shrink-0 items-center gap-3 self-end sm:self-center">
			<span class="text-xs text-muted-foreground">
				{sessionsCount || 1} Perangkat Aktif
			</span>
			<Button
				variant="link"
				size="sm"
				class="h-auto p-0 text-xs font-bold text-primary underline underline-offset-2"
				onclick={onManageSessions}
			>
				Kelola Sesi
			</Button>
		</div>
	</div>
</Card.Root>
