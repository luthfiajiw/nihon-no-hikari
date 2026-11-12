import type { PaginatedResult, PaginationQueryOptions } from '$lib/models/pagination.model';
import type {
	KotobaMediaRecord,
	KotobaTopicInput,
	KotobaTopicRecord
} from '../entities/kotoba-api.entity';

export interface KotobaRepository {
	list(admin: boolean): Promise<KotobaTopicRecord[]>;
	listPaginated(
		admin: boolean,
		options?: PaginationQueryOptions & { level?: string; status?: string; sort?: string }
	): Promise<PaginatedResult<KotobaTopicRecord>>;
	detail(id: string, admin: boolean): Promise<KotobaTopicRecord>;
	save(id: string | null, input: KotobaTopicInput): Promise<KotobaTopicRecord>;
	remove(id: string): Promise<void>;
	upload(kind: 'cover' | 'audio', file: File): Promise<KotobaMediaRecord>;
}
