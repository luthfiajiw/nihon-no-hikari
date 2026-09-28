<script lang="ts">
	import SignInView from '$features/signin/presentation/sign-in-view.svelte';
	import bgImg from '$lib/assets/images/signin-bg.png';
</script>

<svelte:head>
  <title>Masuk - Nihongo no Hikari</title>
  <meta name="description" content="Masuk ke akun Anda." />
</svelte:head>

<div
	class="flex h-screen w-full items-center justify-center px-4 bg-cover bg-center"
	style="background-image: url('{bgImg}')"
>
	<SignInView />
</div>
