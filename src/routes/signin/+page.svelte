<script lang="ts">
	import SignInView from '$features/auth/presentation/sign-in-view.svelte';
	import bgImg from '$lib/assets/images/signin-bg.png';
	import logo from '$lib/assets/images/gakkobit-full-logo.png';
</script>

<svelte:head>
	<title>Masuk - Gakkobit</title>
	<meta name="description" content="Masuk ke akun Anda." />
</svelte:head>

<main
	class="relative flex min-h-svh w-full justify-end bg-cover bg-left"
	style="background-image: url('{bgImg}')"
>
	<div
		class="absolute top-4 left-6 text-5xl font-bold text-taupe-600"
		style="writing-mode: vertical-rl;"
	>
		<img src={logo} alt="Logo Gakkobit" class="mx-auto h-12 object-contain" />
	</div>
	<SignInView />
</main>
