import { describe, expect, it } from 'vitest';
import { initialCourseAdminContent } from './course-admin-content-form.model';
import { courseAdminContentPayload } from '../../domain/course-admin-content-policy';
import type { CourseAdminEditorData } from '../../domain/entities/course-admin.entity';

describe('admin prerequisites in editor drafts', () => {
	const data: CourseAdminEditorData = {
		kind: 'module',
		id: 'module-id',
		parentId: null,
		catalog: {},
		levels: [],
		record: {
			module_prerequisites: ['required-module'],
			lesson_prerequisites: ['required-lesson'],
			is_entry: false
		},
		draft: null
	};
	for (const kind of ['module', 'lesson'] as const) {
		const field = `${kind}_prerequisites`;
		it(`loads and submits existing ${kind} prerequisites and entry status`, () => {
			const item = initialCourseAdminContent({ ...data, kind });
			const payload = JSON.parse(courseAdminContentPayload(kind, item));
			expect(payload[field]).toEqual(data.record?.[field]);
			expect(payload.is_entry).toBe(false);
		});
		it(`preserves ${kind} prerequisites when opening an older draft`, () => {
			const item = initialCourseAdminContent({ ...data, kind, draft: { title: 'Older draft' } });
			expect(JSON.parse(courseAdminContentPayload(kind, item))[field]).toEqual(
				data.record?.[field]
			);
		});
		it(`keeps explicitly cleared ${kind} prerequisites empty`, () => {
			const item = initialCourseAdminContent({
				...data,
				kind,
				draft: { [field]: [], is_entry: false }
			});
			const payload = JSON.parse(courseAdminContentPayload(kind, item));
			expect(payload[field]).toEqual([]);
			expect(payload.is_entry).toBe(false);
		});
		it(`sends no ${kind} prerequisite when marked as entry content`, () => {
			const item = initialCourseAdminContent({ ...data, kind });
			item.is_entry = true;
			expect(JSON.parse(courseAdminContentPayload(kind, item))[field]).toEqual([]);
		});
		it(`loads and sends only one ${kind} prerequisite from older multi-prerequisite data`, () => {
			const item = initialCourseAdminContent({
				...data,
				kind,
				record: { [field]: ['first', 'second'] }
			});
			expect(JSON.parse(courseAdminContentPayload(kind, item))[field]).toEqual(['first']);
			expect(
				JSON.parse(
					courseAdminContentPayload(kind, { [field]: ['first', 'second'], is_entry: false })
				)[field]
			).toEqual(['first']);
		});
	}
});
