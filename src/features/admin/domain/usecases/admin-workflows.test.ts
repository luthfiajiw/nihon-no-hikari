import { describe, expect, it, vi } from 'vitest';
import type { AdminRepository } from '../repositories/admin.repository';
import { GetAdminEditorUseCase } from './get-admin-editor.usecase';
import { GetAdminCourseDetailUseCase } from './get-admin-course-detail.usecase';
import { ManageAdminContentUseCase } from './manage-admin-content.usecase';
import { ChangeAdminUserRoleUseCase } from './change-admin-user-role.usecase';
import { PreviewAdminLessonUseCase } from './preview-admin-lesson.usecase';
import { ReorderAdminContentUseCase } from './reorder-admin-content.usecase';

function fixture() {
	return {
		reorderContent: vi.fn().mockResolvedValue(undefined),
		checkAccess: vi.fn().mockResolvedValue(undefined),
		getCatalog: vi
			.fn()
			.mockResolvedValue({ courses: [], modules: [], lessons: [], question_sets: [] }),
		getContentList: vi.fn().mockResolvedValue([]),
		getContent: vi.fn().mockResolvedValue({ data: { id: 'course', title: 'N5' }, draft: null }),
		getLevels: vi.fn().mockResolvedValue([{ id: 'level', name: 'N5' }]),
		getTemplates: vi.fn().mockResolvedValue([]),
		getTemplate: vi.fn(),
		previewTemplate: vi.fn(),
		saveTemplate: vi.fn(),
		getUsers: vi.fn().mockResolvedValue([]),
		saveContent: vi.fn().mockResolvedValue({ id: 'created' }),
		publishContent: vi.fn().mockResolvedValue({ id: 'published-version' }),
		removeContent: vi.fn().mockResolvedValue(undefined),
		restoreContent: vi.fn().mockResolvedValue(undefined),
		changeRole: vi.fn().mockResolvedValue(undefined),
		previewLesson: vi.fn().mockResolvedValue({ content: '<p>safe</p>', tips: '' })
	} satisfies AdminRepository;
}
describe('admin content ordering', () => {
	const parent_id = '11111111-1111-4111-8111-111111111111';
	const id = '22222222-2222-4222-8222-222222222222';
	it.each(['module', 'lesson'] as const)(
		'saves a complete %s order independently from publishing',
		async (kind) => {
			const repository = fixture();
			const input = { parent_id, ordered_ids: [id] };
			await new ReorderAdminContentUseCase(repository).exec(kind, input);
			expect(repository.reorderContent).toHaveBeenCalledWith(kind, input);
			expect(repository.saveContent).not.toHaveBeenCalled();
			expect(repository.publishContent).not.toHaveBeenCalled();
		}
	);
	it('preserves server conflicts', async () => {
		const repository = fixture();
		const useCase = new ReorderAdminContentUseCase(repository);
		const payload = { parent_id, ordered_ids: [id] };
		repository.reorderContent.mockRejectedValue({ status: 409 });
		await expect(useCase.exec('module', payload)).rejects.toMatchObject({ status: 409 });
	});
});

describe('admin editor and catalog loading', () => {
	it('loads new courses with levels without downloading the catalog or a nonexistent resource', async () => {
		const repository = fixture();
		const data = await new GetAdminEditorUseCase(repository).exec('course', 'new', null);
		expect(data.record).toBeNull();
		expect(data.levels).toEqual([{ id: 'level', name: 'N5' }]);
		expect(repository.getCatalog).not.toHaveBeenCalled();
		expect(repository.getContent).not.toHaveBeenCalled();
		expect(repository.getTemplates).not.toHaveBeenCalled();
	});
	it('loads a question set with its draft, parents and writing templates', async () => {
		const repository = fixture();
		repository.getContent.mockResolvedValue({
			data: { id: 'set', title: 'Live' },
			draft: { title: 'Draft' }
		});
		const data = await new GetAdminEditorUseCase(repository).exec('question_set', 'set', 'lesson');
		expect(data.draft).toEqual({ title: 'Draft' });
		expect(data.parentId).toBe('lesson');
		expect(repository.getTemplates).toHaveBeenCalledOnce();
		expect(repository.getLevels).not.toHaveBeenCalled();
	});
	it('only requests the selected course catalog', async () => {
		const repository = fixture();
		await new GetAdminCourseDetailUseCase(repository).exec('selected-course');
		expect(repository.getContent).toHaveBeenCalledWith('course', 'selected-course');
		expect(repository.getCatalog).toHaveBeenCalledWith('selected-course');
	});
	it('rejects unsupported content kinds before accessing the repository', async () => {
		const repository = fixture();
		await expect(
			new GetAdminEditorUseCase(repository).exec('unknown', 'new', null)
		).rejects.toMatchObject({ status: 400 });
		expect(repository.getCatalog).not.toHaveBeenCalled();
	});
});
describe('admin content lifecycle', () => {
	it('creates and edits drafts using the same parsed payload contract', async () => {
		const repository = fixture();
		const useCase = new ManageAdminContentUseCase(repository);
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
		expect(repository.saveContent.mock.calls).toEqual([
			['course', null, course],
			['lesson', 'existing', lesson]
		]);
	});
	it('requires a payload when saving a draft', async () => {
		const repository = fixture();
		await expect(
			new ManageAdminContentUseCase(repository).exec('save', 'course', 'new')
		).rejects.toMatchObject({ status: 400 });
		expect(repository.saveContent).not.toHaveBeenCalled();
	});
	it('requires a saved draft before publishing and preserves a new published version id', async () => {
		const repository = fixture();
		const useCase = new ManageAdminContentUseCase(repository);
		await expect(useCase.exec('publish', 'question_set', 'new')).rejects.toMatchObject({
			status: 400
		});
		expect(repository.publishContent).not.toHaveBeenCalled();
		await expect(useCase.exec('publish', 'question_set', 'set')).resolves.toEqual({
			id: 'published-version'
		});
	});
	it('delegates archive/delete and restore independently', async () => {
		const repository = fixture();
		const useCase = new ManageAdminContentUseCase(repository);
		await useCase.exec('remove', 'lesson', 'lesson');
		await useCase.exec('restore', 'lesson', 'lesson');
		expect(repository.removeContent).toHaveBeenCalledWith('lesson', 'lesson');
		expect(repository.restoreContent).toHaveBeenCalledWith('lesson', 'lesson');
	});
});
describe('admin role authorization and preview', () => {
	const userId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
	it('rejects unauthorized actors before writing', async () => {
		const repository = fixture();
		const useCase = new ChangeAdminUserRoleUseCase(repository);
		await expect(
			useCase.exec({ id: 'actor', role: 'User' }, userId, 'Admin')
		).rejects.toMatchObject({ status: 403 });
		expect(repository.changeRole).not.toHaveBeenCalled();
	});
	it('sends a valid role change', async () => {
		const repository = fixture();
		await new ChangeAdminUserRoleUseCase(repository).exec(
			{ id: 'actor', role: 'Admin' },
			userId,
			'User'
		);
		expect(repository.changeRole).toHaveBeenCalledWith(userId, 'User');
	});
	it('preserves sanitized content returned by the server', async () => {
		const repository = fixture();
		const useCase = new PreviewAdminLessonUseCase(repository);
		await expect(useCase.exec({ content: '<script>unsafe</script>', tips: '' })).resolves.toEqual({
			content: '<p>safe</p>',
			tips: ''
		});
	});
});
