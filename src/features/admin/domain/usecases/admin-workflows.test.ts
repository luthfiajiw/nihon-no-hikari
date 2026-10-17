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
	it.each(['module', 'lesson'])(
		'saves a complete %s order independently from publishing',
		async (kind) => {
			const repository = fixture();
			const input = { parent_id, ordered_ids: [id] };
			await new ReorderAdminContentUseCase(repository).exec(kind, JSON.stringify(input));
			expect(repository.reorderContent).toHaveBeenCalledWith(kind, input);
			expect(repository.saveContent).not.toHaveBeenCalled();
			expect(repository.publishContent).not.toHaveBeenCalled();
		}
	);
	it.each([
		'{',
		'null',
		'[]',
		'{}',
		JSON.stringify({ parent_id: 'invalid', ordered_ids: [id] }),
		JSON.stringify({ parent_id, ordered_ids: [id, id.toUpperCase()] }),
		JSON.stringify({ parent_id, ordered_ids: ['00000000-0000-0000-0000-000000000000'] }),
		JSON.stringify({ parent_id, ordered_ids: Array(32769).fill(id) })
	])('rejects malformed order payload %# before writing', async (payload) => {
		const repository = fixture();
		await expect(
			new ReorderAdminContentUseCase(repository).exec('module', payload)
		).rejects.toMatchObject({ status: 400 });
		expect(repository.reorderContent).not.toHaveBeenCalled();
	});
	it('rejects unsupported kinds and preserves server conflicts', async () => {
		const repository = fixture();
		const useCase = new ReorderAdminContentUseCase(repository);
		const payload = JSON.stringify({ parent_id, ordered_ids: [id] });
		await expect(useCase.exec('course', payload)).rejects.toMatchObject({ status: 400 });
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
		await expect(useCase.exec('save', 'course', 'new', '{"title":"N5"}')).resolves.toEqual({
			id: 'created'
		});
		await useCase.exec('save', 'lesson', 'existing', '{"content":{"content":"<p>あ</p>"}}');
		expect(repository.saveContent.mock.calls).toEqual([
			['course', null, { title: 'N5' }],
			['lesson', 'existing', { content: { content: '<p>あ</p>' } }]
		]);
	});
	it.each(['{', 'null', '[]', '42'])(
		'rejects invalid draft payload %s without writing data',
		async (payload) => {
			const repository = fixture();
			await expect(
				new ManageAdminContentUseCase(repository).exec('save', 'course', 'new', payload)
			).rejects.toMatchObject({ status: 400 });
			expect(repository.saveContent).not.toHaveBeenCalled();
		}
	);
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
describe('admin role and preview validation', () => {
	const userId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
	it('rejects unauthorized actors and malformed role changes before writing', async () => {
		const repository = fixture();
		const useCase = new ChangeAdminUserRoleUseCase(repository);
		await expect(
			useCase.exec({ id: 'actor', role: 'User' }, userId, 'Admin')
		).rejects.toMatchObject({ status: 403 });
		await expect(
			useCase.exec({ id: 'actor', role: 'Admin' }, 'invalid', 'Admin')
		).rejects.toMatchObject({ status: 400 });
		await expect(
			useCase.exec({ id: 'actor', role: 'Admin' }, userId, 'Owner')
		).rejects.toMatchObject({ status: 400 });
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
	it('rejects malformed preview requests and preserves sanitized content', async () => {
		const repository = fixture();
		const useCase = new PreviewAdminLessonUseCase(repository);
		await expect(useCase.exec({ content: 'invalid' })).rejects.toMatchObject({ status: 400 });
		await expect(
			useCase.exec({ content: { content: '<script>unsafe</script>', tips: '' } })
		).resolves.toEqual({ content: '<p>safe</p>', tips: '' });
	});
});
