import { describe, expect, it } from 'vitest';
import { questionAdminContentPayload } from './question-admin-content-policy';
describe('assessment parents', () => {
	it('sends exactly one parent for each assessment kind', () => {
		expect(
			JSON.parse(
				questionAdminContentPayload({ kind: 'practice', module_id: '', lesson_id: 'lesson-id' })
			)
		).toEqual({ kind: 'practice', module_id: null, lesson_id: 'lesson-id' });
		expect(
			JSON.parse(
				questionAdminContentPayload({
					kind: 'final_exam',
					module_id: 'module-id',
					lesson_id: ''
				})
			)
		).toEqual({ kind: 'final_exam', module_id: 'module-id', lesson_id: null });
	});
});
