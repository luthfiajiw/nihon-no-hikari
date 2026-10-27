import { expect, it } from 'vitest';
import { matchesContent } from './content-status';
it('filters courses by text and treats archived content separately from published content', () => {
	const course = {
		id: 'course',
		title: 'Bahasa Jepang N5',
		slug: 'dasar',
		is_published: true,
		archived_at: '2026-01-01'
	};
	expect(matchesContent(course, ' n5 ', 'archived')).toBe(true);
	expect(matchesContent(course, 'dasar', 'published')).toBe(false);
	expect(matchesContent(course, 'N4', 'all')).toBe(false);
});
