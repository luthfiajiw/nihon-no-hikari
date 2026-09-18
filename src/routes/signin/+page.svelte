<script lang="ts">
	import SignInView from "$features/signin/views/sign-in-view.svelte";
	import bgImg from "$lib/assets/images/signin-bg.png";
</script>

<div
	class="flex h-screen w-full items-center justify-center px-4 bg-cover bg-center"
	style="background-image: url('{bgImg}')"
>
	<SignInView />
</div>