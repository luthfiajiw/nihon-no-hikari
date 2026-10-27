import { requestJson } from '$lib/http/request-json';
import type { UserAdminRole, UserAdminRecord } from '../../domain/entities/user-admin.entity';
type ApiPayload<T> = { data: T; error?: string; message?: string };
export class UserSource {
	constructor(private readonly fetcher: typeof fetch) {}

	private adminRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
		return requestJson<T>(this.fetcher, `/api/v1/admin${path}`, options);
	}

	async getAdminUsers(): Promise<UserAdminRecord[]> {
		return (await this.adminRequest<ApiPayload<UserAdminRecord[]>>('/users')).data;
	}

	async changeAdminRole(userId: string, role: UserAdminRole): Promise<void> {
		await this.adminRequest(`/users/${encodeURIComponent(userId)}/role`, {
			method: 'PATCH',
			body: JSON.stringify({ role })
		});
	}
}
