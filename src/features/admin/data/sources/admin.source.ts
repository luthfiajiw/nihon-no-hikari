import {
	AdminError,
	type AdminCatalog,
	type AdminContentKind,
	type AdminContentDetail,
	type AdminRecord,
	type AdminContentRecord,
	type AdminMutationResult,
	type ManagedUser,
	type AdminUserRole,
	type AdminLessonContent
} from '../../domain/entities/admin.entity';

type ApiPayload<T> = { data: T; error?: string; message?: string };

export class AdminSource {
	constructor(private readonly fetcher: typeof fetch) {}

	private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
		try {
			const response = await this.fetcher(`/api/v1/admin${path}`, {
				...options,
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					...Object.fromEntries(new Headers(options.headers))
				}
			});
			if (response.status === 204) return undefined as T;
			const data = (await response.json().catch(() => ({}))) as T & {
				error?: string;
				message?: string;
			};
			if (!response.ok)
				throw new AdminError(
					response.status,
					data?.error || data?.message || 'Operasi admin gagal. Silakan coba lagi.'
				);
			return data;
		} catch (error) {
			if (error instanceof AdminError) throw error;
			throw new AdminError(502, 'Gagal terhubung ke server.');
		}
	}

	private contentPath(kind: AdminContentKind, id?: string): string {
		return `/content/${kind}${id ? `/${encodeURIComponent(id)}` : ''}`;
	}

	async checkAccess(): Promise<void> {
		await this.request('/me');
	}
	async getCatalog(courseId?: string): Promise<AdminCatalog> {
		const payload = await this.request<ApiPayload<AdminCatalog>>(
			`/catalog${courseId ? `?course_id=${encodeURIComponent(courseId)}` : ''}`
		);
		return payload.data;
	}
	async getContentList(kind: AdminContentKind): Promise<AdminRecord[]> {
		return (await this.request<ApiPayload<AdminRecord[]>>(this.contentPath(kind))).data;
	}
	getContent(kind: AdminContentKind, id: string): Promise<AdminContentDetail> {
		return this.request(this.contentPath(kind, id));
	}
	async getLevels(): Promise<AdminContentRecord[]> {
		return (await this.request<ApiPayload<AdminContentRecord[]>>('/levels')).data;
	}
	async getTemplates(): Promise<AdminContentRecord[]> {
		return (await this.request<ApiPayload<AdminContentRecord[]>>('/templates')).data;
	}
	async getUsers(): Promise<ManagedUser[]> {
		return (await this.request<ApiPayload<ManagedUser[]>>('/users')).data;
	}
	saveContent(
		kind: AdminContentKind,
		id: string | null,
		payload: AdminContentRecord
	): Promise<AdminMutationResult> {
		return this.request(this.contentPath(kind, id ?? undefined), {
			method: id ? 'PATCH' : 'POST',
			body: JSON.stringify(payload)
		});
	}
	publishContent(kind: AdminContentKind, id: string): Promise<AdminMutationResult> {
		return this.request(`${this.contentPath(kind, id)}/publish`, { method: 'POST' });
	}
	async removeContent(kind: AdminContentKind, id: string): Promise<void> {
		await this.request(this.contentPath(kind, id), { method: 'DELETE' });
	}
	async restoreContent(kind: AdminContentKind, id: string): Promise<void> {
		await this.request(`${this.contentPath(kind, id)}/restore`, { method: 'POST' });
	}
	async changeRole(userId: string, role: AdminUserRole): Promise<void> {
		await this.request(`/users/${encodeURIComponent(userId)}/role`, {
			method: 'PATCH',
			body: JSON.stringify({ role })
		});
	}
	async previewLesson(content: AdminLessonContent): Promise<AdminLessonContent> {
		return (
			await this.request<ApiPayload<AdminLessonContent>>('/lesson-content/preview', {
				method: 'POST',
				body: JSON.stringify({ content })
			})
		).data;
	}
}
