import { requestJson } from '$lib/http/request-json';
import type { UserAdminRole, UserAdminRecord } from '../../domain/entities/user-admin.entity';
import type {
	UserProfileData,
	UpdateProfilePayload,
	ChangePasswordPayload,
	LinkGooglePayload
} from '../../domain/entities/user-profile.entity';
import type { AuthUser } from '$features/auth/domain/entities/auth.entity';

type ApiPayload<T> = { data: T; error?: string; message?: string };

export class UserSource {
	constructor(private readonly fetcher: typeof fetch) {}

	private adminRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
		return requestJson<T>(this.fetcher, `/api/v1/admin${path}`, options);
	}

	private userRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
		return requestJson<T>(this.fetcher, `/api/v1/user${path}`, options);
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

	async getProfile(): Promise<UserProfileData> {
		return (await this.userRequest<ApiPayload<UserProfileData>>('/profile')).data;
	}

	async updateProfile(payload: UpdateProfilePayload): Promise<AuthUser> {
		return (
			await this.userRequest<ApiPayload<AuthUser>>('/profile', {
				method: 'PATCH',
				body: JSON.stringify(payload)
			})
		).data;
	}

	async changePassword(payload: ChangePasswordPayload): Promise<void> {
		await this.userRequest('/password', {
			method: 'POST',
			body: JSON.stringify(payload)
		});
	}

	async linkGoogle(payload: LinkGooglePayload): Promise<void> {
		await this.userRequest('/link-google', {
			method: 'POST',
			body: JSON.stringify(payload)
		});
	}

	async revokeOtherSessions(): Promise<void> {
		await this.userRequest('/sessions/other', {
			method: 'DELETE'
		});
	}
}
