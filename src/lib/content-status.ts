type ContentSummary = {
	title: string;
	slug?: string;
	archived_at?: string | null;
	is_published?: boolean;
};

export function matchesContent(item: ContentSummary, query: string, status: string): boolean {
	const actual = item.archived_at ? 'archived' : item.is_published ? 'published' : 'draft';
	return (
		(status === 'all' || status === actual) &&
		`${item.title} ${item.slug ?? ''}`
			.toLocaleLowerCase()
			.includes(query.trim().toLocaleLowerCase())
	);
}
