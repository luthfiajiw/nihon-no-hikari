import { describe, expect, it } from 'vitest';
import { contentPayload, matchesContent } from './content-policy';

describe('admin form payload', () => {
	it('serializes a reactive proxy without cloning it and omits unrelated empty UUIDs', () => {
		const item = new Proxy(
			{
				level_id: 'level-id',
				course_id: '',
				module_id: '',
				title: 'N5',
				slug: 'n5',
				order_index: 0
			},
			{}
		);
		expect(JSON.parse(contentPayload('course', item))).toEqual({
			level_id: 'level-id',
			title: 'N5',
			slug: 'n5',
			order_index: 0
		});
	});
	it('keeps lesson JSON and only its relevant parent', () => {
		const content = { content: '<p>あ</p>', tips: 'Latihan', audio: 'a' };
		expect(
			JSON.parse(
				contentPayload('lesson', {
					module_id: 'module-id',
					level_id: '',
					title: 'A',
					slug: 'a',
					content
				})
			)
		).toEqual({ module_id: 'module-id', title: 'A', slug: 'a', content });
	});
	it('sends exactly one parent for each assessment kind', () => {
		expect(
			JSON.parse(
				contentPayload('question_set', { kind: 'practice', module_id: '', lesson_id: 'lesson-id' })
			)
		).toEqual({ kind: 'practice', module_id: null, lesson_id: 'lesson-id' });
		expect(
			JSON.parse(
				contentPayload('question_set', {
					kind: 'final_exam',
					module_id: 'module-id',
					lesson_id: ''
				})
			)
		).toEqual({ kind: 'final_exam', module_id: 'module-id', lesson_id: null });
	});
});

it('filters courses by text and treats archived content separately from published content', () => {
	const course = {
		id: 'course',
		title: 'Bahasa Jepang N5',
		slug: 'dasar',
		is_published: true,
		archived_at: '2026-01-01'
	};
	expect(matchesContent(course, ' n5 ', 'archived')).toBe(true);
	expect(matchesContent(course, 'dasar', 'published')).toBe(false);
	expect(matchesContent(course, 'N4', 'all')).toBe(false);
});
