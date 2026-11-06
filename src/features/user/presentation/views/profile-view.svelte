<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import ProfileAvatarDialog from '../components/profile-avatar-dialog.svelte';
	import type { UserProfileData } from '../../domain/entities/user-profile.entity';
	import type { AuthUser } from '$features/auth/domain/entities/auth.entity';
	import googleLogo from '$lib/assets/images/google-logo.png';
	import {
		User as UserIcon,
		Shield,
		KeyRound,
		Camera,
		Laptop,
		Smartphone,
		Globe,
		CheckCircle2,
		AlertCircle,
		LoaderCircle,
		LogOut,
		Clock
	} from 'lucide-svelte';

	interface Props {
		data: {
			profile: UserProfileData;
			user?: AuthUser;
		};
		form?: {
			success?: boolean;
			message?: string;
			error?: string;
			user?: AuthUser;
		} | null;
	}

	let { data, form }: Props = $props();

	let avatarDialogOpen = $state(false);
	let currentAvatar = $state('');
	let isUpdatingProfile = $state(false);
	let isChangingPassword = $state(false);
	let isRevokingSessions = $state(false);

	$effect(() => {
		currentAvatar = data.profile.avatar_url || '';
	});

	// Update avatar when selected from dialog
	function handleAvatarSelected(url: string) {
		currentAvatar = url;
	}

	// Friendly device name from user-agent
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

<svelte:head>
	<title>Profil & Pengaturan Akun - Gakkobit</title>
</svelte:head>

<div class="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
	<!-- Page Header -->
	<div class="flex flex-col gap-1">
		<h1 class="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-neutral-50">
			Profil & Pengaturan Akun
		</h1>
		<p class="text-sm text-neutral-500 dark:text-neutral-400">
			Kelola identitas diri, avatar karakter, kredensial kata sandi, dan riwayat sesi masuk akun Anda.
		</p>
	</div>

	<!-- Form Status Alerts -->
	{#if form?.error}
		<div
			class="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
			role="alert"
		>
			<AlertCircle class="size-5 shrink-0 text-red-600 dark:text-red-400" />
			<p>{form.error}</p>
		</div>
	{/if}

	{#if form?.success && form?.message}
		<div
			class="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-300"
			role="status"
		>
			<CheckCircle2 class="size-5 shrink-0 text-green-600 dark:text-green-400" />
			<p>{form.message}</p>
		</div>
	{/if}

	<!-- Tabs Navigation -->
	<Tabs.Root value="profile" class="space-y-6">
		<Tabs.List class="grid w-full grid-cols-2 max-w-md">
			<Tabs.Trigger value="profile" class="flex items-center gap-2">
				<UserIcon class="size-4" />
				Profil Saya
			</Tabs.Trigger>
			<Tabs.Trigger value="security" class="flex items-center gap-2">
				<Shield class="size-4" />
				Keamanan & Akun
			</Tabs.Trigger>
		</Tabs.List>

		<!-- ==================== TAB 1: PROFIL ==================== -->
		<Tabs.Content value="profile" class="space-y-6 focus-visible:outline-none">
			<div class="grid gap-6 md:grid-cols-3">
				<!-- Left Card: Avatar & Summary -->
				<Card.Root class="flex flex-col items-center p-6 text-center md:col-span-1">
					<div class="relative group">
						<Avatar.Root class="size-28 rounded-full border-4 border-white shadow-md dark:border-neutral-800">
							<Avatar.Image
								src={currentAvatar ||
									'https://gcwjewiszjevcgonvhld.supabase.co/storage/v1/object/public/public-avatars/gakkobit-default-ava.jpg'}
								alt={data.profile.display_name}
							/>
							<Avatar.Fallback class="text-2xl font-bold">
								{data.profile.display_name?.charAt(0)?.toUpperCase() ?? 'U'}
							</Avatar.Fallback>
						</Avatar.Root>
						<button
							type="button"
							class="absolute bottom-0 right-0 flex size-9 items-center justify-center rounded-full bg-primary text-white shadow hover:bg-primary/90 transition-transform active:scale-95"
							onclick={() => (avatarDialogOpen = true)}
							title="Ubah Avatar"
						>
							<Camera class="size-4" />
						</button>
					</div>

					<h2 class="mt-4 text-lg font-bold text-neutral-900 dark:text-neutral-50">
						{data.profile.display_name}
					</h2>
					<p class="text-xs text-neutral-500 break-all">{data.profile.email}</p>

					<div class="mt-3 flex items-center gap-2">
						<Badge variant={data.profile.role === 'Admin' ? 'default' : 'secondary'}>
							{data.profile.role}
						</Badge>
						{#if data.profile.google_linked}
							<Badge variant="outline" class="gap-1 text-xs">
								<img src={googleLogo} alt="Google" class="size-3" />
								Google
							</Badge>
						{/if}
					</div>

					<Button
						variant="outline"
						size="sm"
						class="mt-6 w-full gap-2 text-xs"
						onclick={() => (avatarDialogOpen = true)}
					>
						<Camera class="size-3.5" />
						Pilih Preset Avatar
					</Button>
				</Card.Root>

				<!-- Right Card: Profile Form -->
				<Card.Root class="p-6 md:col-span-2">
					<Card.Header class="px-0 pt-0">
						<Card.Title class="text-lg font-bold">Informasi Akun</Card.Title>
						<Card.Description>
							Perbarui nama tampilan yang akan dilihat oleh pengguna lain dan mentor.
						</Card.Description>
					</Card.Header>

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
						class="mt-4 space-y-5"
					>
						<!-- Hidden Avatar Input -->
						<input type="hidden" name="avatar_url" value={currentAvatar} />

						<div class="space-y-2">
							<Label for="display_name" class="text-sm font-medium">Nama Tampilan</Label>
							<Input
								id="display_name"
								name="display_name"
								type="text"
								required
								maxlength={120}
								defaultValue={data.profile.display_name}
								placeholder="Masukkan nama tampilan Anda"
							/>
							<p class="text-xs text-neutral-500">
								Nama ini akan ditampilkan pada sertifikat, forum diskusi, dan header aplikasi.
							</p>
						</div>

						<div class="space-y-2">
							<Label for="email" class="text-sm font-medium">Alamat Email</Label>
							<Input
								id="email"
								type="email"
								disabled
								value={data.profile.email}
								class="bg-neutral-100 text-neutral-600 dark:bg-neutral-800/60 dark:text-neutral-400"
							/>
							<p class="text-xs text-neutral-500">
								Email merupakan identitas unik akun Anda dan tidak dapat diubah.
							</p>
						</div>

						<div class="flex justify-end pt-2">
							<Button type="submit" disabled={isUpdatingProfile} class="gap-2">
								{#if isUpdatingProfile}
									<LoaderCircle class="size-4 animate-spin" />
									Menyimpan…
								{:else}
									Simpan Perubahan
								{/if}
							</Button>
						</div>
					</form>
				</Card.Root>
			</div>
		</Tabs.Content>

		<!-- ==================== TAB 2: KEAMANAN & AKUN ==================== -->
		<Tabs.Content value="security" class="space-y-6 focus-visible:outline-none">
			<!-- 1. Password Section -->
			<Card.Root class="p-6">
				<Card.Header class="px-0 pt-0">
					<div class="flex items-center gap-2">
						<KeyRound class="size-5 text-primary" />
						<Card.Title class="text-lg font-bold">
							{data.profile.has_password ? 'Ubah Kata Sandi' : 'Buat Kata Sandi Akun'}
						</Card.Title>
					</div>
					<Card.Description>
						{#if data.profile.has_password}
							Pastikan akun Anda menggunakan kata sandi yang kuat dan unik minimal 8 karakter.
						{:else}
							Akun Anda terdaftar melalui Google OAuth. Anda dapat membuat kata sandi baru untuk mengaktifkan login langsung dengan email dan kata sandi.
						{/if}
					</Card.Description>
				</Card.Header>

				{#if !data.profile.has_password}
					<div class="my-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
						<p class="font-semibold">💡 Info Akun Google</p>
						<p class="mt-1">
							Anda saat ini masuk menggunakan Google. Menambahkan kata sandi memungkinkan Anda masuk dengan dua opsi (Google OAuth maupun Email & Password).
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
					class="mt-4 space-y-4 max-w-lg"
				>
					{#if data.profile.has_password}
						<div class="space-y-2">
							<Label for="current_password" class="text-sm font-medium">Kata Sandi Saat Ini</Label>
							<Input
								id="current_password"
								name="current_password"
								type="password"
								required
								placeholder="••••••••"
							/>
						</div>
					{/if}

					<div class="space-y-2">
						<Label for="new_password" class="text-sm font-medium">Kata Sandi Baru</Label>
						<Input
							id="new_password"
							name="new_password"
							type="password"
							required
							minlength={8}
							placeholder="Minimal 8 karakter"
						/>
					</div>

					<div class="space-y-2">
						<Label for="confirm_password" class="text-sm font-medium">Konfirmasi Kata Sandi Baru</Label>
						<Input
							id="confirm_password"
							name="confirm_password"
							type="password"
							required
							minlength={8}
							placeholder="Ulangi kata sandi baru"
						/>
					</div>

					<div class="pt-2">
						<Button type="submit" disabled={isChangingPassword} class="gap-2">
							{#if isChangingPassword}
								<LoaderCircle class="size-4 animate-spin" />
								Memperbarui…
							{:else}
								{data.profile.has_password ? 'Perbarui Kata Sandi' : 'Buat Kata Sandi'}
							{/if}
						</Button>
					</div>
				</form>
			</Card.Root>

			<!-- 2. Connected Accounts -->
			<Card.Root class="p-6">
				<Card.Header class="px-0 pt-0">
					<Card.Title class="text-lg font-bold">Akun Terhubung</Card.Title>
					<Card.Description>
						Layanan pihak ketiga yang ditautkan ke akun Nihon No Hikari Anda.
					</Card.Description>
				</Card.Header>

				<div class="mt-4 divide-y divide-neutral-200 dark:divide-neutral-800">
					<div class="flex items-center justify-between py-3">
						<div class="flex items-center gap-3">
							<div class="flex size-10 items-center justify-center rounded-lg border border-neutral-200 bg-white p-2 dark:border-neutral-700">
								<img src={googleLogo} alt="Google" class="size-5 object-contain" />
							</div>
							<div>
								<p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">Google</p>
								<p class="text-xs text-neutral-500">
									{data.profile.google_linked
										? 'Akun Google Anda terhubung dan dapat digunakan untuk masuk.'
										: 'Tautkan akun Google untuk mempermudah proses masuk.'}
								</p>
							</div>
						</div>

						<div>
							{#if data.profile.google_linked}
								<Badge variant="outline" class="gap-1 border-green-300 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/40 dark:text-green-300">
									<CheckCircle2 class="size-3.5" />
									Terhubung
								</Badge>
							{:else}
								<Badge variant="secondary">Belum Terhubung</Badge>
							{/if}
						</div>
					</div>
				</div>
			</Card.Root>

			<!-- 3. Active Sessions -->
			<Card.Root class="p-6">
				<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<Card.Title class="text-lg font-bold">Sesi Masuk & Perangkat Aktif</Card.Title>
						<Card.Description>
							Daftar perangkat dan browser yang saat ini memiliki akses aktif ke akun Anda.
						</Card.Description>
					</div>

					{#if data.profile.sessions?.length > 1}
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
								class="gap-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400"
							>
								{#if isRevokingSessions}
									<LoaderCircle class="size-3.5 animate-spin" />
								{:else}
									<LogOut class="size-3.5" />
								{/if}
								Keluar dari Sesi Lain
							</Button>
						</form>
					{/if}
				</div>

				<div class="mt-4 divide-y divide-neutral-200 dark:divide-neutral-800">
					{#each data.profile.sessions as session (session.id)}
						{@const device = parseDevice(session.user_agent)}
						<div class="flex items-center justify-between py-3.5">
							<div class="flex items-center gap-3">
								<div class="flex size-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
									{#if device.isMobile}
										<Smartphone class="size-4" />
									{:else}
										<Laptop class="size-4" />
									{/if}
								</div>
								<div>
									<div class="flex items-center gap-2">
										<p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">
											{device.name}
										</p>
										{#if session.is_current}
											<Badge variant="default" class="h-5 px-1.5 text-[10px]">
												Perangkat Ini
											</Badge>
										{/if}
									</div>
									<div class="flex items-center gap-2 text-xs text-neutral-500">
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
						<p class="py-4 text-center text-xs text-neutral-500">
							Tidak ada data sesi aktif lainnya.
						</p>
					{/each}
				</div>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>
</div>

<!-- Avatar Picker Dialog -->
<ProfileAvatarDialog
	bind:open={avatarDialogOpen}
	currentAvatarUrl={currentAvatar}
	onSelect={handleAvatarSelected}
/>
