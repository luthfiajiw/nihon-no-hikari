<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Laptop, Smartphone, LoaderCircle, LogOut, Clock } from 'lucide-svelte';
	import type { ProfileSessionSummary } from '../../domain/entities/user-profile.entity';

	interface Props {
		sessions?: ProfileSessionSummary[];
	}

	let { sessions = [] }: Props = $props();

	let isRevokingSessions = $state(false);

	function parseDevice(ua: string): { name: string; isMobile: boolean } {
		if (!ua) return { name: 'Perangkat Tidak Dikenal', isMobile: false };
		const isMobile = /mobile|iphone|android|ipad/i.test(ua);
		let browser = 'Browser';
		if (/edg/i.test(ua)) browser = 'Microsoft Edge';
		else if (/chrome|crios/i.test(ua)) browser = 'Google Chrome';
		else if (/firefox|fxios/i.test(ua)) browser = 'Mozilla Firefox';
		else if (/safari/i.test(ua)) browser = 'Apple Safari';

		let os = 'Desktop';
		if (/windows/i.test(ua)) os = 'Windows';
		else if (/macintosh|mac os/i.test(ua)) os = 'macOS';
		else if (/linux/i.test(ua)) os = 'Linux';
		else if (/android/i.test(ua)) os = 'Android';
		else if (/iphone|ipad|ios/i.test(ua)) os = 'iOS';

		return { name: `${browser} di ${os}`, isMobile };
	}

	function formatDate(iso: string): string {
		try {
			return new Date(iso).toLocaleDateString('id-ID', {
				day: 'numeric',
				month: 'short',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		} catch {
			return iso;
		}
	}
</script>

<Card.Root class="p-6">
	<Card.Header class="px-0 pt-0">
		<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<Card.Title class="text-lg font-bold">Sesi Masuk & Perangkat Aktif</Card.Title>
				<Card.Description>
					Daftar perangkat dan browser yang saat ini memiliki akses aktif ke akun Anda.
				</Card.Description>
			</div>

			{#if sessions.length > 1}
				<form
					method="POST"
					action="?/revokeSessions"
					use:enhance={() => {
						isRevokingSessions = true;
						return async ({ update }) => {
							isRevokingSessions = false;
							await update();
						};
					}}
				>
					<Button
						type="submit"
						variant="outline"
						size="sm"
						disabled={isRevokingSessions}
						class="gap-2 text-xs text-destructive hover:bg-destructive/10"
					>
						{#if isRevokingSessions}
							<LoaderCircle class="animate-spin" data-icon="inline-start" />
						{:else}
							<LogOut data-icon="inline-start" />
						{/if}
						Keluar dari Sesi Lain
					</Button>
				</form>
			{/if}
		</div>
	</Card.Header>

	<Card.Content class="px-0">
		<div class="divide-y divide-border">
			{#each sessions as session (session.id)}
				{@const device = parseDevice(session.user_agent)}
				<div class="flex items-center justify-between py-3.5">
					<div class="flex items-center gap-3">
						<div
							class="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground"
						>
							{#if device.isMobile}
								<Smartphone class="size-4" />
							{:else}
								<Laptop class="size-4" />
							{/if}
						</div>
						<div class="flex flex-col">
							<div class="flex items-center gap-2">
								<p class="text-sm font-semibold text-foreground">
									{device.name}
								</p>
								{#if session.is_current}
									<Badge variant="default" class="h-5 px-1.5 text-[10px]">Perangkat Ini</Badge>
								{/if}
							</div>
							<div class="flex items-center gap-2 text-xs text-muted-foreground">
								<span>{session.client_ip || 'IP Tersembunyi'}</span>
								<span>•</span>
								<span class="flex items-center gap-1">
									<Clock class="size-3" />
									{formatDate(session.created_at)}
								</span>
							</div>
						</div>
					</div>
				</div>
			{:else}
				<p class="py-4 text-center text-xs text-muted-foreground">
					Tidak ada data sesi aktif lainnya.
				</p>
			{/each}
		</div>
	</Card.Content>
</Card.Root>
