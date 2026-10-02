import { describe, expect, it, vi } from 'vitest';
import { HttpClient } from '$lib/http-client';
import { CourseSource } from './course.source';

describe('CourseSource', () => {
	it('gets and returns the course list', async () => {
		const responseData = {
			success: true,
			message: 'Daftar kursus berhasil diambil.',
			data: [
				{
					id: 'course-1',
					slug: 'jlpt-n5',
					title: 'JLPT N5',
					description: 'Dasar bahasa Jepang',
					total_hours: 24,
					total_lessons: 36,
					level: { id: 'level-1', code: 'N5', name: 'Pemula' }
				}
			]
		};
		const mockFetch = vi.fn().mockResolvedValue(
			new Response(JSON.stringify(responseData), {
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			})
		);
		const source = new CourseSource(
			new HttpClient({ fetch: mockFetch, baseUrl: 'http://localhost:8080/api' })
		);

		const result = await source.getList();

		expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/api/v1/courses', {
			method: 'GET',
			headers: { Accept: 'application/json' }
		});
		expect(result).toEqual(responseData);
	});

	it('throws the API message when the request fails', async () => {
		const mockFetch = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ success: false, message: 'Kursus tidak dapat diambil.' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			})
		);
		const source = new CourseSource(new HttpClient({ fetch: mockFetch, baseUrl: '' }));

		await expect(source.getList()).rejects.toThrow('Kursus tidak dapat diambil.');
	});
});
