export interface PaginationMeta {
	page: number;
	limit: number;
	total: number;
	total_pages: number;
}

export interface PaginatedResult<T> {
	items: T[];
	meta: PaginationMeta;
}

export interface PaginationQueryOptions {
	page?: number;
	limit?: number;
	search?: string;
}

export function parsePaginationParams(url: URL): { page: number; limit: number; search: string } {
	const rawPage = url.searchParams.get('page');
	const rawLimit = url.searchParams.get('limit');
	const search = (url.searchParams.get('search') ?? url.searchParams.get('q') ?? '').trim();

	const page = rawPage ? Math.max(1, parseInt(rawPage, 10) || 1) : 1;
	const limit = rawLimit ? Math.min(100, Math.max(1, parseInt(rawLimit, 10) || 10)) : 10;

	return { page, limit, search };
}

export function defaultPaginationMeta(total = 0, limit = 10, page = 1): PaginationMeta {
	const safeLimit = Math.max(1, limit);
	return {
		page,
		limit: safeLimit,
		total,
		total_pages: Math.max(1, Math.ceil(total / safeLimit))
	};
}
