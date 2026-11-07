<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { AlertCircle, CheckCircle2 } from 'lucide-svelte';
	import ProfileSidebarNav from '../components/profile-sidebar-nav.svelte';
	import ProfileAvatarCard from '../components/profile-avatar-card.svelte';
	import ProfileInfoForm from '../components/profile-info-form.svelte';
	import ProfileSecurityBanner from '../components/profile-security-banner.svelte';
	import ProfilePasswordForm from '../components/profile-password-form.svelte';
	import ProfileConnectedAccountsCard from '../components/profile-connected-accounts-card.svelte';
	import ProfileSessionsCard from '../components/profile-sessions-card.svelte';
	import ProfileAvatarDialog from '../components/profile-avatar-dialog.svelte';
	import type { UserProfileData } from '../../domain/entities/user-profile.entity';
	import type { AuthUser } from '$features/auth/domain/entities/auth.entity';

	interface Props {
		data: {
			profile: UserProfileData;
		};
		form?: {
			success?: boolean;
			message?: string;
			error?: string;
			user?: AuthUser;
		} | null;
	}

	const DEFAULT_AVATAR =
		'https://gcwjewiszjevcgonvhld.supabase.co/storage/v1/object/public/public-avatars/gakkobit-default-ava.jpg';

	let { data, form }: Props = $props();

	let activeTab = $state('profile');
	let avatarDialogOpen = $state(false);
	let currentAvatar = $derived(data.profile.avatar_url || '');

	function handleAvatarSelected(url: string) {
		currentAvatar = url;
	}

	function handleResetAvatar() {
		currentAvatar = DEFAULT_AVATAR;
	}

	function handleResetFormAvatar() {
		currentAvatar = data.profile.avatar_url || '';
	}
</script>

<svelte:head>
	<title>Akun Saya</title>
</svelte:head>

<div class="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
	<!-- Page Header -->
	<section class="flex flex-col gap-1">
		<h1 class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Akun Saya</h1>
		<p class="text-sm leading-relaxed text-muted-foreground">
			Kelola identitas diri, avatar karakter, kredensial kata sandi, dan riwayat sesi masuk akun
			pembelajaran Anda.
		</p>
	</section>

	<!-- Form Status Feedback -->
	{#if form?.error}
		<div
			class="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
			role="alert"
		>
			<AlertCircle class="size-5 shrink-0" />
			<p>{form.error}</p>
		</div>
	{/if}

	{#if form?.success && form?.message}
		<div
			class="flex items-center gap-3 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
			role="status"
		>
			<CheckCircle2 class="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
			<p>{form.message}</p>
		</div>
	{/if}

	<!-- Layout Grid with Vertical Sidebar Navigation -->
	<Tabs.Root bind:value={activeTab} class="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
		<!-- Left Sidebar Menu -->
		<ProfileSidebarNav />

		<!-- Right Content Area -->
		<div class="col-span-12 flex flex-col gap-6 lg:col-span-8">
			<!-- TAB 1: PROFIL SAYA -->
			<Tabs.Content value="profile" class="flex flex-col gap-6 focus-visible:outline-none">
				<ProfileAvatarCard
					profile={data.profile}
					{currentAvatar}
					defaultAvatar={DEFAULT_AVATAR}
					onOpenAvatarDialog={() => (avatarDialogOpen = true)}
					onResetAvatar={handleResetAvatar}
				/>

				<ProfileInfoForm
					profile={data.profile}
					{currentAvatar}
					onResetAvatar={handleResetFormAvatar}
				/>

				<ProfileSecurityBanner
					sessionsCount={data.profile.sessions?.length || 1}
					onManageSessions={() => (activeTab = 'security')}
				/>
			</Tabs.Content>

			<!-- TAB 2: KEAMANAN & AKUN -->
			<Tabs.Content value="security" class="flex flex-col gap-6 focus-visible:outline-none">
				<ProfilePasswordForm hasPassword={data.profile.has_password} />

				<ProfileConnectedAccountsCard
					googleLinked={data.profile.google_linked}
					email={data.profile.email}
				/>

				<ProfileSessionsCard sessions={data.profile.sessions} />
			</Tabs.Content>
		</div>
	</Tabs.Root>
</div>

<!-- Avatar Picker Dialog -->
<ProfileAvatarDialog
	bind:open={avatarDialogOpen}
	currentAvatarUrl={currentAvatar}
	onSelect={handleAvatarSelected}
/>
