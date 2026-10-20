<script lang="ts">
	import WritingCanvas from '$features/question/presentation/components/writing-canvas.svelte';
	import type {
		WritingGuide,
		StrokeInput
	} from '$features/question/domain/entities/question.entity';
	let { guide }: { guide: WritingGuide } = $props();
	const id = $props.id();
	const markerId = `${id}-direction`;
	let trial = $state<StrokeInput>([]);
</script>

<div class="admin-stack">
	<h2 class="text-xl font-semibold">Pratinjau {guide.character} · {guide.romaji}</h2>
	<p class="text-sm text-slate-600">
		{guide.strokes.length} goresan. Nomor menunjukkan urutan dan panah menunjukkan arah awal.
	</p>
	<svg
		viewBox="0 0 109 109"
		class="mx-auto w-full max-w-64 rounded-xl border bg-white"
		role="img"
		aria-label={`Urutan goresan ${guide.character}`}
	>
		<defs>
			<marker
				id={markerId}
				viewBox="0 0 10 10"
				refX="8"
				refY="5"
				markerWidth="5"
				markerHeight="5"
				orient="auto-start-reverse"
			>
				<path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb" />
			</marker>
		</defs>
		{#each guide.strokes as stroke, index (index)}
			<path
				d={stroke.path}
				fill="none"
				stroke="#334155"
				stroke-width="2.5"
				stroke-linecap="round"
			/>
			<line
				x1={stroke.points[0].x}
				y1={stroke.points[0].y}
				x2={stroke.points[3].x}
				y2={stroke.points[3].y}
				stroke="#2563eb"
				stroke-width="1.2"
				marker-end={`url(#${markerId})`}
			/>
			<text
				x={Math.max(4, stroke.points[0].x - 5)}
				y={Math.max(8, stroke.points[0].y - 5)}
				font-size="7"
				fill="#2563eb"
			>
				{index + 1}
			</text>
		{/each}
	</svg>
	<h3 class="font-semibold">Coba menulis</h3>
	<WritingCanvas {guide} value={trial} onChange={(value) => (trial = value)} />
</div>
