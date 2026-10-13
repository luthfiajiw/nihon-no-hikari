<script lang="ts">
	import type {
		StrokeInput,
		StrokePoint,
		WritingGuide
	} from '$features/question/domain/entities/question.entity';
	import { evaluateStroke } from '$features/question/domain/stroke-evaluator';
	import { Button } from '$lib/components/ui/button';
	import { RotateCcwIcon } from 'lucide-svelte';

	interface Props {
		guide: WritingGuide;
		showGuide?: boolean;
		value: StrokeInput;
		disabled?: boolean;
		onChange: (value: StrokeInput) => void;
	}
	let { guide, showGuide = true, value, disabled = false, onChange }: Props = $props();
	let current = $state<StrokePoint[]>([]);
	let pointerId = $state<number | null>(null);
	let feedback = $state('');
	const colors = ['#60a5fa', '#fb923c', '#34d399', '#c084fc'];
	let complete = $derived(showGuide && value.length === guide.strokes.length);

	function pointFromEvent(event: PointerEvent): StrokePoint {
		const rect =
			event.currentTarget instanceof SVGSVGElement
				? event.currentTarget.getBoundingClientRect()
				: (event.target as SVGSVGElement).getBoundingClientRect();
		return {
			x:
				Math.round(
					Math.max(
						0,
						Math.min(guide.view_box, ((event.clientX - rect.left) / rect.width) * guide.view_box)
					) * 100
				) / 100,
			y:
				Math.round(
					Math.max(
						0,
						Math.min(guide.view_box, ((event.clientY - rect.top) / rect.height) * guide.view_box)
					) * 100
				) / 100
		};
	}

	function pointerDown(event: PointerEvent): void {
		if (disabled || complete || pointerId !== null || (!showGuide && value.length >= 16)) return;
		const svg = event.currentTarget as SVGSVGElement;
		svg.setPointerCapture(event.pointerId);
		pointerId = event.pointerId;
		current = [pointFromEvent(event)];
		feedback = showGuide
			? `Goresan ${value.length + 1} dari ${guide.strokes.length}`
			: `Goresan bebas ${value.length + 1}`;
	}

	function pointerMove(event: PointerEvent): void {
		if (pointerId !== event.pointerId || current.length === 0) return;
		const next = pointFromEvent(event);
		const previous = current.at(-1)!;
		if (
			Math.hypot(next.x - previous.x, next.y - previous.y) >= 0.4 &&
			current.length < (showGuide ? 255 : 127)
		) {
			current = [...current, next];
		}
	}

	function pointerUp(event: PointerEvent): void {
		if (pointerId !== event.pointerId) return;
		const points = [...current, pointFromEvent(event)];
		pointerId = null;
		current = [];
		if (!showGuide) {
			onChange([...value, points]);
			feedback = 'Tulisan tersimpan. Kamu bisa lanjut atau menambah goresan.';
		} else if (evaluateStroke(guide, value.length, points)) {
			onChange([...value, points]);
			feedback =
				value.length + 1 === guide.strokes.length
					? 'Bagus! Semua goresan selesai. Kamu bisa lanjut.'
					: 'Goresan benar. Lanjutkan ke goresan berikutnya.';
		} else {
			feedback = 'Goresan belum sesuai arah atau jalur. Ulangi goresan ini.';
		}
	}

	function pointerCancel(): void {
		pointerId = null;
		current = [];
	}

	function reset(): void {
		pointerCancel();
		onChange([]);
		feedback = '';
	}

	function line(points: StrokePoint[]): string {
		return points.map(({ x, y }) => `${x},${y}`).join(' ');
	}
</script>

<div class="mt-6">
	<div class="mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white">
		<svg
			viewBox={`0 0 ${guide.view_box} ${guide.view_box}`}
			class="block aspect-square w-full touch-none select-none"
			role="img"
			aria-label={showGuide
				? `Panduan menulis ${guide.character}, ${guide.strokes.length} goresan`
				: `Kanvas menulis bunyi ${guide.romaji}`}
			onpointerdown={pointerDown}
			onpointermove={pointerMove}
			onpointerup={pointerUp}
			onpointercancel={pointerCancel}
		>
			{#if showGuide}
				<defs>
					<marker
						id="writing-stroke-arrow"
						markerWidth="4"
						markerHeight="4"
						refX="3"
						refY="2"
						orient="auto"
						markerUnits="userSpaceOnUse"
					>
						<path d="M0,0 L4,2 L0,4 Z" fill="#0369a1" />
					</marker>
				</defs>
				<line
					x1="54.5"
					x2="54.5"
					y1="0"
					y2="109"
					stroke="#cbd5e1"
					stroke-dasharray="2 2"
					stroke-width=".3"
				/>
				<line
					x1="0"
					x2="109"
					y1="54.5"
					y2="54.5"
					stroke="#cbd5e1"
					stroke-dasharray="2 2"
					stroke-width=".3"
				/>
				{#each guide.strokes as stroke, index (index)}
					<path
						d={stroke.path}
						fill="none"
						stroke={colors[index % colors.length]}
						stroke-width="4"
						stroke-linecap="round"
						stroke-linejoin="round"
						opacity={index < value.length ? 0.3 : 0.55}
					/>
					<circle
						cx={stroke.points[0].x}
						cy={stroke.points[0].y}
						r="3"
						fill={colors[index % colors.length]}
						opacity={index === value.length ? 0.9 : 0.5}
					/>
					<text
						x={stroke.points[0].x - 7}
						y={stroke.points[0].y - 3}
						fill={colors[index % colors.length]}
						font-size="7"
						font-weight="bold">{index + 1}</text
					>
					{#if index === value.length}
						<line
							x1={stroke.points[25].x}
							y1={stroke.points[25].y}
							x2={stroke.points[28].x}
							y2={stroke.points[28].y}
							stroke="#0369a1"
							stroke-width="1"
							marker-end="url(#writing-stroke-arrow)"
						/>
					{/if}
				{/each}
			{/if}
			{#each value as points, index (index)}
				<polyline
					points={line(points)}
					fill="none"
					stroke={colors[index % colors.length]}
					stroke-width="3"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			{/each}
			{#if current.length > 1}
				<polyline
					points={line(current)}
					fill="none"
					stroke="#0369a1"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			{/if}
		</svg>
	</div>
	<div class="mt-4 flex items-center justify-between gap-3">
		<p class="text-sm text-slate-600" role="status">
			{feedback ||
				(showGuide
					? 'Ikuti urutan dan arah goresan dari angka yang ditunjukkan.'
					: 'Tulis bebas di kanvas. Satu goresan sudah cukup untuk lanjut.')}
		</p>
		<Button
			type="button"
			variant="outline"
			onclick={reset}
			disabled={disabled || (value.length === 0 && current.length === 0)}
		>
			<RotateCcwIcon class="size-4" /> Ulangi
		</Button>
	</div>
	<p class="mt-2 text-xs text-slate-500">
		Data stroke: <a
			class="underline"
			href="https://kanjivg.tagaini.net/"
			target="_blank"
			rel="noopener noreferrer">KanjiVG</a
		>
		© Ulrich Apel dan kontributor,
		<a
			class="underline"
			href="https://creativecommons.org/licenses/by-sa/3.0/"
			target="_blank"
			rel="noopener noreferrer">CC BY-SA 3.0</a
		>.
	</p>
</div>
