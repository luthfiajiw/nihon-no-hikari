<script lang="ts">
	import CourseHeroBanner from "../components/course-hero-banner.svelte";
	import CourseProgressCard from "../components/course-progress-card.svelte";
	import CourseTile from "../components/course-tile.svelte";
</script>

<div class="p-6 space-y-6">
	<!-- Row 1: Hero Banner (8 cols) + Progress Card (4 cols) -->
	<div class="grid grid-cols-1 gap-4 lg:grid-cols-12 items-stretch">
		<div class="lg:col-span-8 flex">
			<CourseHeroBanner class="w-full" />
		</div>
		<aside class="lg:col-span-4 flex">
			<CourseProgressCard class="w-full h-full" />
		</aside>

		<div class="lg:col-span-8">
			<div class="flex flex-col space-y-4">
				<h2 class="text-xl font-bold text-slate-800 dark:text-slate-100">Daftar Kursus</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
	</div>
</div>