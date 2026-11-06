<script lang="ts">
	import type { PageProps } from './$types';
	import LandingPageView from '$features/landing-page/presentation/views/landing-page-view.svelte';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Gakkobit</title>
	<meta
		name="description"
		content="Platform komprehensif belajar Bahasa Jepang dari N5 hingga N1 dengan SRS Flashcards, audio penutur asli, dan AI Sensei personal tutor."
	/>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
	<link
		href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
		rel="stylesheet"
	/>
	<link
		href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
		rel="stylesheet"
	/>
</svelte:head>

<LandingPageView {data} />
