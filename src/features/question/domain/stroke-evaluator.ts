import type { StrokePoint, WritingGuide } from './entities/question.entity';

function distance(a: StrokePoint, b: StrokePoint): number {
	return Math.hypot(a.x - b.x, a.y - b.y);
}

function resample(
	points: StrokePoint[],
	count: number
): { samples: StrokePoint[]; length: number } {
	const lengths = [0];
	for (let index = 1; index < points.length; index++) {
		lengths.push(lengths[index - 1] + distance(points[index - 1], points[index]));
	}
	const length = lengths.at(-1) ?? 0;
	if (length === 0) return { samples: Array.from({ length: count }, () => points[0]), length };
	let segment = 1;
	const samples = Array.from({ length: count }, (_, index) => {
		const target = (length * index) / (count - 1);
		while (segment < points.length - 1 && lengths[segment] < target) segment++;
		const span = lengths[segment] - lengths[segment - 1];
		const fraction = span > 0 ? (target - lengths[segment - 1]) / span : 0;
		return {
			x: points[segment - 1].x + fraction * (points[segment].x - points[segment - 1].x),
			y: points[segment - 1].y + fraction * (points[segment].y - points[segment - 1].y)
		};
	});
	return { samples, length };
}

export function evaluateStroke(
	guide: WritingGuide,
	strokeIndex: number,
	points: StrokePoint[]
): boolean {
	const reference = guide.strokes[strokeIndex]?.points;
	if (!reference || reference.length !== 32 || points.length < 3 || points.length > 256)
		return false;
	if (
		points.some(
			({ x, y }) =>
				!Number.isFinite(x) ||
				!Number.isFinite(y) ||
				x < 0 ||
				y < 0 ||
				x > guide.view_box ||
				y > guide.view_box
		)
	)
		return false;
	const actual = resample(points, 32);
	const expected = resample(reference, 32);
	if (actual.length === 0 || expected.length === 0) return false;
	const matches = actual.samples.filter(
		(point, index) => distance(point, reference[index]) <= 10
	).length;
	const ratio = actual.length / expected.length;
	return (
		matches / 32 >= 0.85 &&
		ratio >= 0.7 &&
		ratio <= 1.3 &&
		distance(points[0], reference[0]) <= 8 &&
		distance(points.at(-1)!, reference.at(-1)!) <= 8
	);
}
