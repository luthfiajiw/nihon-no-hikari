import { describe, expect, it } from 'vitest';
import guides from './fixtures/hiragana_a_guides.json';
import { evaluateStroke } from './stroke-evaluator';

describe('stroke evaluator with KanjiVG Hiragana baris A fixtures', () => {
	for (const guide of guides) {
		it(`checks order, direction, and path for ${guide.character}`, () => {
			for (let index = 0; index < guide.strokes.length; index++) {
				const points = guide.strokes[index].points;
				expect(evaluateStroke(guide, index, points)).toBe(true);
				expect(evaluateStroke(guide, index, [...points].reverse())).toBe(false);
				expect(
					evaluateStroke(
						guide,
						index,
						points.map(({ x, y }) => ({ x: x + 12, y }))
					)
				).toBe(false);
				if (index + 1 < guide.strokes.length) {
					expect(evaluateStroke(guide, index + 1, points)).toBe(false);
				}
			}
		});
	}
});
