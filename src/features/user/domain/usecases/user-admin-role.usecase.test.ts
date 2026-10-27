import { describe, expect, it, vi } from 'vitest';
import { ChangeUserAdminRoleUseCase } from './user-admin-role.usecase';
function fixture() {
	return { getAdminUsers: vi.fn(), changeAdminRole: vi.fn().mockResolvedValue(undefined) };
}
describe('user role authorization', () => {
	const userId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
	it('rejects unauthorized actors before writing', async () => {
		const repository = fixture();
		const useCase = new ChangeUserAdminRoleUseCase(repository);
		await expect(
			useCase.exec({ id: 'actor', role: 'User' }, userId, 'Admin')
		).rejects.toMatchObject({ status: 403 });
		expect(repository.changeAdminRole).not.toHaveBeenCalled();
	});
	it('sends a valid role change', async () => {
		const repository = fixture();
		await new ChangeUserAdminRoleUseCase(repository).exec(
			{ id: 'actor', role: 'Admin' },
			userId,
			'User'
		);
		expect(repository.changeAdminRole).toHaveBeenCalledWith(userId, 'User');
	});
});
