<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Badge } from "$lib/components/ui/badge";
	import * as Card from "$lib/components/ui/card";
	import { ArcChart } from "layerchart";
	import {
		BookOpenIcon,
		ClockIcon,
		UserIcon,
		ChevronRightIcon,
		CheckCircle2Icon,
		ArrowRightIcon,
		SparklesIcon,

		ArrowLeftIcon,

		TrendingUpIcon


	} from "lucide-svelte";

	// Course Data structure
	interface Lesson {
		id: number;
		title: string;
		description: string;
		status: "completed" | "in_progress" | "not_started";
		duration: string;
		previewText?: string;
	}

	const courseInfo = {
		level: "N5",
		title: "JLPT N5: Dasar Bahasa Jepang & Kana",
		description:
			"Kuasai tata bahasa dasar, Hiragana, Katakana, dan 100 Kanji pertama untuk persiapan ujian JLPT N5 dan percakapan harian.",
		totalLessons: 10,
		estimatedHours: "~3-5 jam",
		targetAudience: "Pemula",
		completedCount: 1,
		progressPercentage: 10
	};

	const lessons: Lesson[] = [
		{
			id: 1,
			title: "Pengenalan Huruf Hiragana",
			description: "Kita mulai dengan mengenal 5 huruf vokal dasar dalam bahasa Jepang: あ, い, う, え, お.",
			status: "completed",
			duration: "15 menit",
			previewText: "あ い う え お"
		},
		{
			id: 2,
			title: "Huruf K-Baris (か, き, く, け, こ)",
			description: 'Belajar huruf yang dimulai dengan "k".',
			status: "not_started",
			duration: "20 menit",
			previewText: "か き く け こ"
		},
		{
			id: 3,
			title: "Huruf S-Baris (さ, し, す, せ, そ)",
			description: 'Belajar huruf yang dimulai dengan "s".',
			status: "not_started",
			duration: "20 menit",
			previewText: "さ し す せ そ"
		},
		{
			id: 4,
			title: "Huruf T-Baris (た, ち, つ, て, と)",
			description: 'Belajar huruf yang dimulai dengan "t".',
			status: "not_started",
			duration: "20 menit",
			previewText: "た ち つ て と"
		},
		{
			id: 5,
			title: "Huruf N-Baris (な, に, ぬ, ね, の)",
			description: 'Belajar huruf yang dimulai dengan "n".',
			status: "not_started",
			duration: "20 menit",
			previewText: "な に ぬ ね の"
		},
		{
			id: 6,
			title: "Huruf H-Baris (は, ひ, ふ, へ, ほ)",
			description: 'Belajar huruf yang dimulai dengan "h".',
			status: "not_started",
			duration: "20 menit"
		},
		{
			id: 7,
			title: "Huruf M-Baris (ま, み, む, め, も)",
			description: 'Belajar huruf yang dimulai dengan "m".',
			status: "not_started",
			duration: "20 menit"
		},
		{
			id: 8,
			title: "Huruf Y-Baris (や, ゆ, よ)",
			description: 'Belajar huruf yang dimulai dengan "y".',
			status: "not_started",
			duration: "15 menit"
		},
		{
			id: 9,
			title: "Huruf R-Baris (ら, り, る, れ, ろ)",
			description: 'Belajar huruf yang dimulai dengan "r".',
			status: "not_started",
			duration: "20 menit"
		},
		{
			id: 10,
			title: "Huruf W-Baris (わ, を, ん)",
			description: 'Belajar huruf yang dimulai dengan "w" dan huruf mati "n".',
			status: "not_started",
			duration: "15 menit"
		}
	];

	// Interactive state
	let activeLessonId = $state(1);

	const activeLesson = $derived(
		lessons.find((l) => l.id === activeLessonId) ?? lessons[0]
	);

	// Data array for Layerchart ArcChart
	const arcChartData = $derived([
		{ key: "completed", value: courseInfo.progressPercentage }
	]);
</script>

<div class="space-y-4 p-6">
	<div class="flex items-center gap-4">
    <Button 
      variant="outline" 
      size="icon" 
      type="button"
      onclick={() => window.history.back()}
    >
      <ArrowLeftIcon />
    </Button>
    <p class="font-semibold">Detail Kursus</p>
  </div>

	<!-- Main Content Area: Row-by-Row Grid Layout -->
	<div class="grid grid-cols-1 gap-4 lg:grid-cols-12 items-stretch">
		<!-- ROW 1: Header / Course Hero Banner (Left 8) + Course Progress Card (Right 4) -->
		<div class="lg:col-span-9 flex">
			<Card.Root class="w-full py-6 flex flex-col justify-between border-sky-100 bg-linear-to-r from-sky-50/90 via-blue-50/50 to-indigo-50/60 shadow-xs dark:border-slate-800 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-800/80">
				<Card.Content class="flex-1 flex flex-col justify-between">
					<!-- Title & Meta Info -->
					<div class="space-y-3 max-w-2xl">
						<div class="flex flex-col items-start gap-2">
							<Badge class="bg-emerald-500 text-white font-extrabold px-3 py-1 text-xs border-none rounded-lg shadow-xs shadow-emerald-500/30 hover:bg-emerald-600">
								{courseInfo.level}
							</Badge>
							<h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
								{courseInfo.title}
							</h1>
						</div>

						<p class="text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
							{courseInfo.description}
						</p>

						<!-- Info Pills using Badge -->
						<div class="flex flex-wrap items-center gap-3 pt-2">
							<div class="flex items-center gap-1.5 rounded-md text-slate-700 bg-white px-2.5 py-1.5 dark:bg-slate-800/60">
								<BookOpenIcon class="size-4 text-sky-500" />
								<span>{courseInfo.totalLessons} Pelajaran</span>
							</div>
							<div class="flex items-center gap-1.5 rounded-md text-slate-700 bg-white px-2.5 py-1.5 dark:bg-slate-800/60">
								<ClockIcon class="size-4 text-sky-500" />
								<span>{courseInfo.estimatedHours} Jam</span>
							</div>
							<div class="flex items-center gap-1.5 rounded-md text-slate-700 bg-white px-2.5 py-1.5 dark:bg-slate-800/60">
								<UserIcon class="size-4 text-sky-500" />
								<span>{courseInfo.targetAudience}</span>
							</div>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</div>

		<div class="lg:col-span-3 flex">
			<Card.Root class="w-full flex flex-col justify-between">
				<Card.Header>
					<Card.Title class="flex items-center gap-3 font-semibold">
						<TrendingUpIcon class="size-4 text-sky-600"/>
						Progress Kursus
					</Card.Title>
				</Card.Header>

				<Card.Content class="flex-1 flex flex-col justify-center space-y-2">
					<div class="flex items-center gap-4 py-2">
						<!-- ArcChart gauge using Layerchart -->
						<div class="relative flex size-32 shrink-0 items-center justify-center">
							<ArcChart
								data={arcChartData}
								maxValue={100}
								innerRadius={-18}
								cornerRadius={4}
								cRange={["#0284c7"]}
							/>
							<span class="absolute text-lg font-extrabold text-slate-900 dark:text-slate-100">
								{courseInfo.progressPercentage}%
							</span>
						</div>

						<!-- Detailed Progress Numbers -->
						<div class="flex-1 space-y-1">
							<div class="flex items-center justify-between text-sm">
								<span class="font-semibold text-slate-800 dark:text-slate-200">
									{courseInfo.completedCount} / {courseInfo.totalLessons} Pelajaran
								</span>
							</div>
							<p class="text-sm text-slate-400 dark:text-slate-500">
								Level {courseInfo.level} - {courseInfo.title}
							</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</div>

		<!-- ROW 2: Lessons List Card (Left 8) + Active/Next Lesson Card (Right 4) -->
		<div class="lg:col-span-9 flex">
			<div class="flex flex-col gap-4 w-full">
        <Card.Root class="w-full h-full flex flex-col justify-between">
          <Card.Header class="border-b border-slate-100 dark:border-slate-800">
            <Card.Title class="text-base font-bold text-slate-900 dark:text-slate-100">
              Daftar Pelajaran
            </Card.Title>
          </Card.Header>

          <Card.Content class="p-0 divide-y divide-slate-100 dark:divide-slate-800 flex-1">
            {#each lessons.slice(0, 5) as lesson (lesson.id)}
              <button
                type="button"
                onclick={() => (activeLessonId = lesson.id)}
                class={`w-full flex items-center justify-between p-4 text-left transition-colors sm:px-6 ${
                  activeLessonId === lesson.id
                    ? "bg-sky-50/50 dark:bg-sky-950/20"
                    : "hover:bg-slate-50/70 dark:hover:bg-slate-800/50"
                }`}
              >
                <div class="flex items-start gap-4">
                  <span
                    class={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      activeLessonId === lesson.id
                        ? "bg-sky-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {lesson.id}
                  </span>

                  <div class="space-y-1">
                    <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {lesson.title}
                    </h3>
                    <p class="text-xs text-slate-500 line-clamp-1 dark:text-slate-400">
                      {lesson.description}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-4 shrink-0">
                  {#if lesson.status === "completed"}
                    <Badge class="hidden sm:flex items-center gap-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 border-none font-semibold">
                      <CheckCircle2Icon class="size-3" />
                      Selesai
                    </Badge>
                  {:else}
                    <Badge variant="outline" class="hidden sm:inline-flex text-slate-500 dark:text-slate-400 font-medium">
                      Belum dimulai
                    </Badge>
                  {/if}

                  <span class="text-xs font-medium text-slate-400">
                    {lesson.duration}
                  </span>

                  <ChevronRightIcon class="size-4 text-slate-400" />
                </div>
              </button>
            {/each}
          </Card.Content>
        </Card.Root>
        <Card.Root class="border-sky-100 bg-gradient-to-r from-sky-50/80 via-blue-50/40 to-indigo-50/60 dark:border-slate-800 dark:from-slate-900 dark:to-slate-800/60">
          <Card.Content class="flex flex-col items-center justify-between gap-4 sm:flex-row p-6">
            <div class="flex items-center gap-3">
              <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-2xs text-sky-600 dark:bg-slate-800 dark:text-sky-400">
                <SparklesIcon class="size-5" />
              </div>
              <div>
                <h4 class="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Ingat, konsistensi adalah kunci!
                </h4>
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  Sedikit demi sedikit, kamu akan bisa membaca dan menulis bahasa Jepang dengan lancar.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              class="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border-slate-200 rounded-xl shrink-0 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Lanjut ke Latihan
              <ArrowRightIcon class="ml-1.5 size-3.5" />
            </Button>
          </Card.Content>
        </Card.Root>
      </div>
		</div>

		<div class="lg:col-span-3">
			<Card.Root class="w-full flex flex-col justify-between">
				<Card.Content class="h-full flex flex-col justify-between">
					<!-- Active Lesson Info -->
					<div class="space-y-4">
						<div class="flex items-center gap-2">
							<Badge variant="secondary" class="bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 font-semibold border-none">
								Berikutnya
							</Badge>
						</div>

						<div>
							<Card.Title class="text-xl font-bold text-slate-900 dark:text-slate-100">
								{activeLesson.title}
							</Card.Title>
							<Card.Description class="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
								{activeLesson.description}
							</Card.Description>
						</div>
					</div>

					<!-- Actions -->
					<div class="flex justify-between items-center pt-4">
						<span class="text-sm font-medium text-slate-400">
							{activeLesson.duration}
						</span>
						<Button
							type="button"
							class="bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-xl px-5 shadow-xs transition-transform active:scale-95"
						>
							Mulai Belajar
							<ArrowRightIcon class="ml-1.5 size-4" />
						</Button>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>
