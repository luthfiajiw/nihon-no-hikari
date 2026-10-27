import { describe, expect, it, vi } from 'vitest';
import type { QuestionAdminRepository } from '../repositories/question-admin.repository';
import { GetQuestionAdminEditorUseCase } from './question-admin-editor.usecase';
import { ManageQuestionAdminContentUseCase } from './question-admin-content.usecase';
function fixture() {
	return {
		getAdminContentList: vi.fn().mockResolvedValue([]),
		getAdminContent: vi
			.fn()
			.mockResolvedValue({ data: { id: 'set', title: 'Live' }, draft: { title: 'Draft' } }),
		getAdminTemplates: vi.fn().mockResolvedValue([]),
		getAdminTemplate: vi.fn(),
		previewAdminTemplate: vi.fn(),
		saveAdminTemplate: vi.fn(),
		saveAdminContent: vi.fn().mockResolvedValue({ id: 'created' }),
		publishAdminContent: vi.fn().mockResolvedValue({ id: 'published-version' }),
		removeAdminContent: vi.fn().mockResolvedValue(undefined),
		restoreAdminContent: vi.fn().mockResolvedValue(undefined)
	} satisfies QuestionAdminRepository;
}
describe('question administrative workflows', () => {
	it('loads the draft, writing templates and injected course lookup', async () => {
		const repo = fixture();
		const catalog = { getCatalog: vi.fn().mockResolvedValue({ modules: [], lessons: [] }) };
		const data = await new GetQuestionAdminEditorUseCase(repo, catalog).exec('set', 'lesson');
		expect(data.draft).toEqual({ title: 'Draft' });
		expect(data.parentId).toBe('lesson');
		expect(repo.getAdminTemplates).toHaveBeenCalledOnce();
		expect(catalog.getCatalog).toHaveBeenCalledOnce();
	});
	it('does not request a nonexistent resource when creating a set', async () => {
		const repo = fixture();
		const data = await new GetQuestionAdminEditorUseCase(repo, {
			getCatalog: async () => ({})
		}).exec('new', null);
		expect(data.record).toBeNull();
		expect(repo.getAdminContent).not.toHaveBeenCalled();
	});
	it('creates drafts and rejects missing payloads', async () => {
		const repo = fixture();
		const usecase = new ManageQuestionAdminContentUseCase(repo);
		const payload = { title: 'Draft' };
		await expect(usecase.exec('save', 'new', payload)).resolves.toEqual({ id: 'created' });
		expect(repo.saveAdminContent).toHaveBeenCalledWith(null, payload);
		await expect(usecase.exec('save', 'new')).rejects.toMatchObject({ status: 400 });
	});
	it('requires a draft before publishing and returns the new version id', async () => {
		const repo = fixture();
		const usecase = new ManageQuestionAdminContentUseCase(repo);
		await expect(usecase.exec('publish', 'new')).rejects.toMatchObject({ status: 400 });
		expect(repo.publishAdminContent).not.toHaveBeenCalled();
		await expect(usecase.exec('publish', 'set')).resolves.toEqual({ id: 'published-version' });
	});
	it('keeps archive and restore operations independent', async () => {
		const repo = fixture();
		const usecase = new ManageQuestionAdminContentUseCase(repo);
		await usecase.exec('remove', 'set');
		await usecase.exec('restore', 'set');
		expect(repo.removeAdminContent).toHaveBeenCalledWith('set');
		expect(repo.restoreAdminContent).toHaveBeenCalledWith('set');
	});
});
