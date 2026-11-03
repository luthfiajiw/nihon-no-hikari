<script lang="ts">
	import RegisterView from '$features/auth/presentation/register-view.svelte';
	import bgImg from '$lib/assets/images/signin-bg.png';
	import logo from '$lib/assets/images/gakkobit-full-logo.png';
</script>

<svelte:head>
	<title>Daftar - Gakkobit</title>
	<meta name="description" content="Daftar akun baru di Gakkobit." />
</svelte:head>

<main
	class="relative flex min-h-svh w-full justify-end bg-cover bg-left"
	style="background-image: url('{bgImg}')"
>
	<div
		class="absolute top-4 left-6 text-5xl font-bold text-taupe-600"
		style="writing-mode: vertical-rl;"
	>
		<img src={logo} alt="Logo Gakkobit" class="mx-auto h-13 object-contain" />
	</div>
	<RegisterView />
</main>
