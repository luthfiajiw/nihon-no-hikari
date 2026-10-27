import { describe, expect, it, vi } from 'vitest';
import type { CourseAdminRepository } from '../repositories/course-admin.repository';
import { GetCourseAdminEditorUseCase } from './course-admin-editor.usecase';
import { GetCourseAdminDetailUseCase } from './course-admin-detail.usecase';
import { ManageCourseAdminContentUseCase } from './course-admin-content.usecase';
import { PreviewCourseAdminLessonUseCase } from './course-admin-lesson-preview.usecase';
import { ReorderCourseAdminContentUseCase } from './course-admin-reorder.usecase';
function fixture() {
	return {
		reorderAdminContent: vi.fn().mockResolvedValue(undefined),
		getAdminCatalog: vi
			.fn()
			.mockResolvedValue({ courses: [], modules: [], lessons: [], question_sets: [] }),
		getAdminContentList: vi.fn().mockResolvedValue([]),
		getAdminContent: vi
			.fn()
			.mockResolvedValue({ data: { id: 'course', title: 'N5' }, draft: null }),
		getAdminLevels: vi.fn().mockResolvedValue([{ id: 'level', name: 'N5' }]),
		saveAdminContent: vi.fn().mockResolvedValue({ id: 'created' }),
		publishAdminContent: vi.fn().mockResolvedValue({ id: 'published-version' }),
		removeAdminContent: vi.fn().mockResolvedValue(undefined),
		restoreAdminContent: vi.fn().mockResolvedValue(undefined),
		previewAdminLesson: vi.fn().mockResolvedValue({ content: '<p>safe</p>', tips: '' })
	} satisfies CourseAdminRepository;
}
describe('admin content ordering', () => {
	const parent_id = '11111111-1111-4111-8111-111111111111';
	const id = '22222222-2222-4222-8222-222222222222';
	it.each(['module', 'lesson'] as const)(
		'saves a complete %s order independently from publishing',
		async (kind) => {
			const repository = fixture();
			const input = { parent_id, ordered_ids: [id] };
			await new ReorderCourseAdminContentUseCase(repository).exec(kind, input);
			expect(repository.reorderAdminContent).toHaveBeenCalledWith(kind, input);
			expect(repository.saveAdminContent).not.toHaveBeenCalled();
			expect(repository.publishAdminContent).not.toHaveBeenCalled();
		}
	);
	it('preserves server conflicts', async () => {
		const repository = fixture();
		const useCase = new ReorderCourseAdminContentUseCase(repository);
		const payload = { parent_id, ordered_ids: [id] };
		repository.reorderAdminContent.mockRejectedValue({ status: 409 });
		await expect(useCase.exec('module', payload)).rejects.toMatchObject({ status: 409 });
	});
});

describe('admin editor and catalog loading', () => {
	it('loads new courses with levels without downloading the catalog or a nonexistent resource', async () => {
		const repository = fixture();
		const data = await new GetCourseAdminEditorUseCase(repository).exec('course', 'new', null);
		expect(data.record).toBeNull();
		expect(data.levels).toEqual([{ id: 'level', name: 'N5' }]);
		expect(repository.getAdminCatalog).not.toHaveBeenCalled();
		expect(repository.getAdminContent).not.toHaveBeenCalled();
	});

	it('only requests the selected course catalog', async () => {
		const repository = fixture();
		await new GetCourseAdminDetailUseCase(repository).exec('selected-course');
		expect(repository.getAdminContent).toHaveBeenCalledWith('course', 'selected-course');
		expect(repository.getAdminCatalog).toHaveBeenCalledWith('selected-course');
	});
	it('rejects unsupported content kinds before accessing the repository', async () => {
		const repository = fixture();
		await expect(
			new GetCourseAdminEditorUseCase(repository).exec('unknown', 'new', null)
		).rejects.toMatchObject({ status: 400 });
		expect(repository.getAdminCatalog).not.toHaveBeenCalled();
	});
});
describe('admin content lifecycle', () => {
	it('creates and edits drafts using the same parsed payload contract', async () => {
		const repository = fixture();
		const useCase = new ManageCourseAdminContentUseCase(repository);
		const course = {
			title: 'N5',
			slug: 'n5',
			level_id: '11111111-1111-4111-8111-111111111111'
		};
		const lesson = {
			title: 'Hiragana',
			slug: 'hiragana',
			module_id: '22222222-2222-4222-8222-222222222222',
			content: { content: '<p>あ</p>', tips: '' }
		};
		await expect(useCase.exec('save', 'course', 'new', course)).resolves.toEqual({
			id: 'created'
		});
		await useCase.exec('save', 'lesson', 'existing', lesson);
		expect(repository.saveAdminContent.mock.calls).toEqual([
			['course', null, course],
			['lesson', 'existing', lesson]
		]);
	});
	it('requires a payload when saving a draft', async () => {
		const repository = fixture();
		await expect(
			new ManageCourseAdminContentUseCase(repository).exec('save', 'course', 'new')
		).rejects.toMatchObject({ status: 400 });
		expect(repository.saveAdminContent).not.toHaveBeenCalled();
	});

	it('delegates archive/delete and restore independently', async () => {
		const repository = fixture();
		const useCase = new ManageCourseAdminContentUseCase(repository);
		await useCase.exec('remove', 'lesson', 'lesson');
		await useCase.exec('restore', 'lesson', 'lesson');
		expect(repository.removeAdminContent).toHaveBeenCalledWith('lesson', 'lesson');
		expect(repository.restoreAdminContent).toHaveBeenCalledWith('lesson', 'lesson');
	});
});

describe('lesson preview', () => {
	it('preserves sanitized content returned by the server', async () => {
		const repository = fixture();
		const useCase = new PreviewCourseAdminLessonUseCase(repository);
		await expect(useCase.exec({ content: '<script>unsafe</script>', tips: '' })).resolves.toEqual({
			content: '<p>safe</p>',
			tips: ''
		});
	});
});
