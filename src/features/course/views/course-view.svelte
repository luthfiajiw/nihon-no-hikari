<script lang="ts">
	import CourseHeroBanner from "./components/course-hero-banner.svelte";
	import CourseProgressCard from "./components/course-progress-card.svelte";
	import CourseTile from "./components/course-tile.svelte";
</script>

<section class="grid grid-cols-4 gap-6 px-6">
	<div class="mt-6 mb-14 flex flex-col gap-6 col-span-3">
		<CourseHeroBanner />

		<div class="flex flex-col gap-4">
			<h2 class="text-xl font-bold text-slate-800 dark:text-slate-100">Daftar Kursus</h2>
			<div class="flex flex-col gap-6">
				<CourseTile 
          isEnrolled
					level="N5"
					title="JLPT N5: Dasar Bahasa Jepang & Kana"
					description="Kuasai tata bahasa dasar, Hiragana, Katakana, dan 100 Kanji pertama untuk persiapan ujian JLPT N5 dan percakapan harian."
					totalHours="24 Jam"
					totalLessons="36 Materi"
					category="Pemula"
				/>
				<CourseTile 
					level="N4"
					title="JLPT N4: Tata Bahasa & Kosakata Menengah Dasar"
					description="Tingkatkan pemahaman tata bahasa Jepang lanjutan, 300 Kanji N4, dan pola kalimat untuk komunikasi sehari-hari."
					totalHours="32 Jam"
					totalLessons="48 Materi"
					category="Menengah Dasar"
				/>
			</div>
		</div>
	</div>

	<aside class="mt-6 col-span-1">
		<CourseProgressCard />
	</aside>
</section>