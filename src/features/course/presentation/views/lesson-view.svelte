<script lang="ts">
	import LessonSidebar from "../components/lesson-sidebar.svelte";
	import LessonContent from "../components/lesson-content.svelte";

	// Types
	interface Lesson {
		id: string;
		title: string;
		order: string;
		status: "completed" | "in_progress" | "not_started";
		isFree?: boolean;
	}

	interface Module {
		id: string;
		title: string;
		order: string;
		completedCount: string;
		lessons: Lesson[];
	}

	// ── Course Data (demo) ──────────────────────────────────────────
	const courseName = "Belajar Fundamental Deep Learning";

	const modules: Module[] = [
		{
			id: "mod-1",
			title: "Persiapan Belajar",
			order: "1",
			completedCount: "6/6",
			lessons: [
				{ id: "1-1", title: "Persetujuan Hak Cipta", order: "1.1", status: "completed", isFree: true },
				{ id: "1-2", title: "Pendahuluan Kelas", order: "1.2", status: "completed", isFree: true },
				{ id: "1-3", title: "Mekanisme Belajar", order: "1.3", status: "completed", isFree: true },
				{ id: "1-4", title: "Forum Diskusi", order: "1.4", status: "completed" },
				{ id: "1-5", title: "Glossarium", order: "1.5", status: "completed" },
				{ id: "1-6", title: "Daftar Referensi", order: "1.6", status: "completed" }
			]
		},
		{
			id: "mod-2",
			title: "Pengenalan Deep Learning",
			order: "2",
			completedCount: "6/14",
			lessons: [
				{ id: "2-1", title: "Pendahuluan Deep Learning", order: "2.1", status: "completed" },
				{ id: "2-2", title: "[Story] Tak Kenal Maka Kenalan!", order: "2.2", status: "completed" },
				{ id: "2-3", title: "[Story] Hi, Neural Network!", order: "2.3", status: "completed" },
				{ id: "2-4", title: "Dasar-Dasar Neural Network", order: "2.4", status: "completed" },
				{ id: "2-5", title: "[Story] Awal Bertemu dengan Deep Learning", order: "2.5", status: "completed" },
				{ id: "2-6", title: "Pengantar Deep Learning", order: "2.6", status: "completed" },
				{ id: "2-7", title: "Pengenalan Time Series", order: "2.7", status: "in_progress" },
				{ id: "2-8", title: "Model Neural Network pada Data Time Series", order: "2.8", status: "not_started" },
				{ id: "2-9", title: "Menggunakan Layer LSTM", order: "2.9", status: "not_started" },
				{ id: "2-10", title: "Latihan: Prediksi Time Series", order: "2.10", status: "not_started" },
				{ id: "2-11", title: "Quiz: Deep Learning Basics", order: "2.11", status: "not_started" },
				{ id: "2-12", title: "Submission: Proyek Deep Learning", order: "2.12", status: "not_started" },
				{ id: "2-13", title: "[Story] Penutup Modul", order: "2.13", status: "not_started" },
				{ id: "2-14", title: "Rangkuman Modul", order: "2.14", status: "not_started" }
			]
		},
		{
			id: "mod-3",
			title: "Reinforcement Learning",
			order: "3",
			completedCount: "0/10",
			lessons: [
				{ id: "3-1", title: "Pendahuluan Reinforcement Learning", order: "3.1", status: "not_started" },
				{ id: "3-2", title: "Konsep Reward & Punishment", order: "3.2", status: "not_started" },
				{ id: "3-3", title: "Q-Learning Dasar", order: "3.3", status: "not_started" },
				{ id: "3-4", title: "Deep Q-Network (DQN)", order: "3.4", status: "not_started" },
				{ id: "3-5", title: "Policy Gradient Methods", order: "3.5", status: "not_started" },
				{ id: "3-6", title: "Latihan: CartPole Problem", order: "3.6", status: "not_started" },
				{ id: "3-7", title: "Actor-Critic Architecture", order: "3.7", status: "not_started" },
				{ id: "3-8", title: "Proximal Policy Optimization (PPO)", order: "3.8", status: "not_started" },
				{ id: "3-9", title: "Quiz: Reinforcement Learning", order: "3.9", status: "not_started" },
				{ id: "3-10", title: "Rangkuman Modul", order: "3.10", status: "not_started" }
			]
		}
	];

	// ── State ──────────────────────────────────────────
	let isSidebarOpen = $state(true);
	let activeLessonId = $state("2-7");

	// Derive the active lesson title
	const activeLessonTitle = $derived.by(() => {
		for (const mod of modules) {
			const found = mod.lessons.find((l) => l.id === activeLessonId);
			if (found) return found.title;
		}
		return "Pengenalan Time Series";
	});

	const completedLessons = $derived.by(() => {
		let count = 0;
		for (const mod of modules) {
			count += mod.lessons.filter((l) => l.status === "completed").length;
		}
		return count;
	});

	const totalLessons = $derived.by(() => {
		let count = 0;
		for (const mod of modules) {
			count += mod.lessons.length;
		}
		return count;
	});

	function toggleSidebar() {
		isSidebarOpen = !isSidebarOpen;
	}

	function handleLessonSelect(lessonId: string) {
		activeLessonId = lessonId;
	}
</script>

<div class="flex w-full h-full overflow-hidden bg-background">
	<div class="flex-1 min-w-0 h-full overflow-hidden">
		<!-- Main content -->
		<LessonContent 
			title={activeLessonTitle}
			content={
				`<div class="text-sm sm:text-base leading-relaxed text-foreground">
					<p class="mb-4">
						Selamat datang, para penjelajah bahasa Jepang! Mari kita mulai hari ini dengan semangat yang
						menyala-nyala!
					</p>

					<p class="mb-4">
						Pada modul ini, kita akan belajar mengenal huruf-huruf dasar dalam sistem penulisan Hiragana.
						Hiragana (ひらがな) adalah salah satu dari tiga sistem penulisan dalam bahasa Jepang. Hiragana
						digunakan untuk menulis kata-kata asli Jepang dan merupakan fondasi penting bagi siapa pun yang
						ingin belajar bahasa Jepang. Sudah siap? Mari berlayar!
					</p>

					<div class="my-8">
						<div class="flex flex-wrap justify-center gap-3">
							<div class="flex flex-col items-center justify-center w-20 h-22 bg-gradient-to-b from-white to-slate-50 dark:from-card dark:to-muted border border-border rounded-xl shadow-xs hover:-translate-y-0.5 hover:shadow-md hover:border-sky-300 dark:hover:border-sky-700 transition-all cursor-default">
								<span class="text-3xl font-semibold text-foreground leading-none">あ</span>
								<span class="text-[11px] font-bold text-sky-600 dark:text-sky-400 mt-1.5 tracking-wider uppercase">a</span>
							</div>
							<div class="flex flex-col items-center justify-center w-20 h-22 bg-gradient-to-b from-white to-slate-50 dark:from-card dark:to-muted border border-border rounded-xl shadow-xs hover:-translate-y-0.5 hover:shadow-md hover:border-sky-300 dark:hover:border-sky-700 transition-all cursor-default">
								<span class="text-3xl font-semibold text-foreground leading-none">い</span>
								<span class="text-[11px] font-bold text-sky-600 dark:text-sky-400 mt-1.5 tracking-wider uppercase">i</span>
							</div>
							<div class="flex flex-col items-center justify-center w-20 h-22 bg-gradient-to-b from-white to-slate-50 dark:from-card dark:to-muted border border-border rounded-xl shadow-xs hover:-translate-y-0.5 hover:shadow-md hover:border-sky-300 dark:hover:border-sky-700 transition-all cursor-default">
								<span class="text-3xl font-semibold text-foreground leading-none">う</span>
								<span class="text-[11px] font-bold text-sky-600 dark:text-sky-400 mt-1.5 tracking-wider uppercase">u</span>
							</div>
							<div class="flex flex-col items-center justify-center w-20 h-22 bg-gradient-to-b from-white to-slate-50 dark:from-card dark:to-muted border border-border rounded-xl shadow-xs hover:-translate-y-0.5 hover:shadow-md hover:border-sky-300 dark:hover:border-sky-700 transition-all cursor-default">
								<span class="text-3xl font-semibold text-foreground leading-none">え</span>
								<span class="text-[11px] font-bold text-sky-600 dark:text-sky-400 mt-1.5 tracking-wider uppercase">e</span>
							</div>
							<div class="flex flex-col items-center justify-center w-20 h-22 bg-gradient-to-b from-white to-slate-50 dark:from-card dark:to-muted border border-border rounded-xl shadow-xs hover:-translate-y-0.5 hover:shadow-md hover:border-sky-300 dark:hover:border-sky-700 transition-all cursor-default">
								<span class="text-3xl font-semibold text-foreground leading-none">お</span>
								<span class="text-[11px] font-bold text-sky-600 dark:text-sky-400 mt-1.5 tracking-wider uppercase">o</span>
							</div>
						</div>
					</div>

					<h2 class="text-xl font-bold text-foreground mt-8 mb-3 tracking-tight">Vokal Dasar (母音 - boin)</h2>
					<p class="mb-4">
						Bahasa Jepang memiliki 5 huruf vokal dasar yang menjadi fondasi seluruh sistem Hiragana.
						Kelima huruf ini adalah <strong class="font-semibold text-foreground">あ (a), い (i), う (u), え (e), お (o)</strong>.
						Setiap huruf konsonan dalam Hiragana selalu diikuti oleh salah satu vokal ini.
					</p>

					<h3 class="text-lg font-semibold text-foreground mt-6 mb-2">Cara Pengucapan</h3>
					<ul class="list-disc pl-6 space-y-1.5 mb-4">
						<li><strong class="font-semibold text-foreground">あ (a)</strong> — diucapkan seperti "a" pada kata "apa"</li>
						<li><strong class="font-semibold text-foreground">い (i)</strong> — diucapkan seperti "i" pada kata "ini"</li>
						<li><strong class="font-semibold text-foreground">う (u)</strong> — diucapkan seperti "u" pada kata "untuk"</li>
						<li><strong class="font-semibold text-foreground">え (e)</strong> — diucapkan seperti "e" pada kata "enak"</li>
						<li><strong class="font-semibold text-foreground">お (o)</strong> — diucapkan seperti "o" pada kata "obat"</li>
					</ul>

					<h3 class="text-lg font-semibold text-foreground mt-6 mb-2">Tips Menghafal</h3>
					<p class="mb-4">
						Cara terbaik untuk menghafal Hiragana adalah dengan berlatih menulis secara berulang.
						Cobalah menulis setiap huruf minimal 10 kali sambil mengucapkannya. Teknik ini disebut
						<em class="italic text-muted-foreground">muscle memory</em> dan sangat efektif untuk mengingat bentuk huruf.
					</p>

					<blockquote class="border-l-4 border-sky-500 bg-sky-50/80 dark:bg-sky-950/30 p-4 rounded-r-lg my-6 text-sm">
						<p class="m-0 text-slate-700 dark:text-slate-300">
							💡 <strong class="font-semibold">Pro tip:</strong> Gunakan kertas bergaris (genkouyoushi) untuk berlatih menulis.
							Setiap kotak membantu menjaga proporsi huruf tetap konsisten.
						</p>
					</blockquote>
				</div>`
			}
		/>
	</div>

	<!-- Right sidebar -->
	<LessonSidebar
		{courseName}
		completedLessons={completedLessons}
		totalLessons={totalLessons}
		{modules}
		{activeLessonId}
		isOpen={isSidebarOpen}
		onToggle={toggleSidebar}
		onLessonSelect={handleLessonSelect}
	/>
</div>
