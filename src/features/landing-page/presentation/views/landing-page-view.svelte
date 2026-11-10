<script lang="ts">
	import { onMount } from 'svelte';
	import LandingHeader from '../components/landing-header.svelte';
	import LandingHeroSection from '../components/landing-hero-section.svelte';
	import LandingCoursesSection from '../components/landing-courses-section.svelte';
	import LandingVocabularySection from '../components/landing-vocabulary-section.svelte';
	import LandingAiSchedulerSection from '../components/landing-ai-scheduler-section.svelte';
	import LandingPracticeSection from '../components/landing-practice-section.svelte';
	import LandingPricingSection from '../components/landing-pricing-section.svelte';
	import LandingCtaSection from '../components/landing-cta-section.svelte';
	import LandingFooterSection from '../components/landing-footer-section.svelte';

	interface Props {
		data: {
			user?: any;
			[key: string]: any;
		};
	}

	let { data }: Props = $props();

	const user = $derived(data.user);
	const displayName = $derived(user?.display_name ?? 'Pengguna');
	const avatarUrl = $derived(
		user?.avatar_url ??
			'https://gcwjewiszjevcgonvhld.supabase.co/storage/v1/object/public/public-avatars/gakkobit-default-ava.jpg'
	);

	let activeSection = $state('beranda');
	let activeCategory = $state<'all' | 'Kata Keterangan' | 'Kata Benda' | 'Kata Kerja'>(
		'Kata Keterangan'
	);
	let selectedExamOption = $state<'A' | 'B' | 'C' | 'D'>('B');
	let isAudioPlaying = $state(false);

	const navSections = [
		{ id: 'beranda', label: 'Beranda' },
		{ id: 'kursus', label: 'Kursus' },
		{ id: 'kosakata', label: 'Kosakata' },
		{ id: 'ai-sensei', label: 'AI Sensei' },
		{ id: 'latihan', label: 'Latihan & Try Out' },
		{ id: 'harga', label: 'Paket & Harga' }
	];

	function scrollTo(id: string, e?: MouseEvent) {
		if (e) e.preventDefault();
		const el = document.getElementById(id);
		if (!el) return;
		activeSection = id;
		const offset = 80;
		const bodyRect = document.body.getBoundingClientRect().top;
		const elementRect = el.getBoundingClientRect().top;
		const elementPosition = elementRect - bodyRect;
		const offsetPosition = elementPosition - offset;

		window.scrollTo({
			top: offsetPosition,
			behavior: 'smooth'
		});
	}

	onMount(() => {
		const handleScroll = () => {
			const scrollPos = window.scrollY + 120;
			for (const sec of navSections) {
				const el = document.getElementById(sec.id);
				if (el) {
					const top = el.offsetTop;
					const height = el.offsetHeight;
					if (scrollPos >= top && scrollPos < top + height) {
						activeSection = sec.id;
						break;
					}
				}
			}
			if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60) {
				activeSection = navSections[navSections.length - 1].id;
			}
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	});

	function playDemoAudio() {
		isAudioPlaying = true;
		setTimeout(() => {
			isAudioPlaying = false;
		}, 1200);
	}
</script>

<div
	class="landing-scope min-h-screen bg-surface font-body-md text-on-surface antialiased selection:bg-primary-fixed selection:text-on-primary-fixed"
>
	<LandingHeader {user} {displayName} {avatarUrl} {activeSection} {navSections} {scrollTo} />

	<main class="min-h-[calc(100vh-20rem)] w-full bg-surface pt-20">
		<div class="flex w-full flex-col">
			<LandingHeroSection {scrollTo} {isAudioPlaying} {playDemoAudio} />

			<LandingCoursesSection {scrollTo} />

			<LandingVocabularySection bind:activeCategory {isAudioPlaying} {playDemoAudio} />

			<LandingAiSchedulerSection />

			<LandingPracticeSection bind:selectedExamOption />

			<LandingPricingSection plans={data.pricingPlans ?? []} />

			<LandingCtaSection />
		</div>
	</main>

	<LandingFooterSection {scrollTo} />
</div>
