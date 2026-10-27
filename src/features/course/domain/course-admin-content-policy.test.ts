import { describe, expect, it } from 'vitest';
import { courseAdminContentPayload } from './course-admin-content-policy';
describe('course payloads', () => {
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
		expect(JSON.parse(courseAdminContentPayload('course', item))).toEqual({
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
				courseAdminContentPayload('lesson', {
					module_id: 'module-id',
					level_id: '',
					title: 'A',
					slug: 'a',
					content
				})
			)
		).toEqual({ module_id: 'module-id', title: 'A', slug: 'a', content });
	});
});
