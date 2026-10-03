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
					total_minutes: 1440,
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

	it('gets and returns a course detail', async () => {
		const responseData = {
			success: true,
			message: 'Detail kursus berhasil diambil.',
			data: {
				id: 'course/1',
				slug: 'jlpt-n5',
				title: 'JLPT N5',
				description: 'Dasar bahasa Jepang',
				total_minutes: 120,
				total_lessons: 1,
				level: { id: 'level-1', code: 'N5', name: 'Pemula' },
				modules: []
			}
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

		await expect(source.getDetail('course/1')).resolves.toEqual(responseData);
		expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/api/v1/courses/course%2F1', {
			method: 'GET',
			headers: { Accept: 'application/json' }
		});
	});

	it('throws the API message when getting a course detail fails', async () => {
		const mockFetch = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ success: false, message: 'Kursus tidak ditemukan.' }), {
				status: 404,
				headers: { 'Content-Type': 'application/json' }
			})
		);
		const source = new CourseSource(new HttpClient({ fetch: mockFetch, baseUrl: '' }));

		await expect(source.getDetail('missing')).rejects.toThrow('Kursus tidak ditemukan.');
	});

	it('gets and returns course modules with their lessons', async () => {
		const responseData = {
			success: true,
			message: 'Modul dan materi berhasil diambil.',
			data: [
				{
					module: {
						id: 'module-1',
						slug: 'hiragana',
						title: 'Hiragana',
						description: 'Mengenal hiragana',
						is_mandatory: true,
						is_entry: true,
						status: 'in_progress',
						estimated_minutes: 30
					},
					lessons: [
						{
							id: 'lesson-1',
							slug: 'vokal-dasar',
							title: 'Vokal Dasar',
							content: '<p>Materi</p>',
							status: 'in_progress'
						}
					]
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

		await expect(source.getModules('course/1')).resolves.toEqual(responseData);
		expect(mockFetch).toHaveBeenCalledWith(
			'http://localhost:8080/api/v1/courses/course%2F1/modules',
			{
				method: 'GET',
				headers: { Accept: 'application/json' }
			}
		);
	});

	it('throws the API message when getting course modules fails', async () => {
		const mockFetch = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ success: false, message: 'Materi tidak ditemukan.' }), {
				status: 404,
				headers: { 'Content-Type': 'application/json' }
			})
		);
		const source = new CourseSource(new HttpClient({ fetch: mockFetch, baseUrl: '' }));

		await expect(source.getModules('missing')).rejects.toThrow('Materi tidak ditemukan.');
	});

	it('gets and returns a lesson detail', async () => {
		const responseData = {
			success: true,
			message: 'Detail materi berhasil diambil.',
			data: {
				id: 'lesson/1',
				slug: 'vokal-dasar',
				title: 'Vokal Dasar',
				content: '<p>Materi</p>',
				status: 'in_progress'
			}
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

		await expect(source.getLesson('course/1', 'lesson/1')).resolves.toEqual(responseData);
		expect(mockFetch).toHaveBeenCalledWith(
			'http://localhost:8080/api/v1/courses/course%2F1/lessons/lesson%2F1',
			{
				method: 'GET',
				headers: { Accept: 'application/json' }
			}
		);
	});

	it('throws the API message when getting a lesson detail fails', async () => {
		const mockFetch = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ success: false, message: 'Materi tidak ditemukan.' }), {
				status: 404,
				headers: { 'Content-Type': 'application/json' }
			})
		);
		const source = new CourseSource(new HttpClient({ fetch: mockFetch, baseUrl: '' }));

		await expect(source.getLesson('course-1', 'missing')).rejects.toThrow(
			'Materi tidak ditemukan.'
		);
	});

	it('updates and returns module progress', async () => {
		const responseData = { success: true, message: 'Progres modul berhasil diperbarui.' };
		const mockFetch = vi.fn().mockResolvedValue(
			new Response(JSON.stringify(responseData), {
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			})
		);
		const source = new CourseSource(
			new HttpClient({ fetch: mockFetch, baseUrl: 'http://localhost:8080/api' })
		);

		await expect(
			source.updateModuleProgress('course/1', 'module/1', { status: 'completed' })
		).resolves.toEqual(responseData);
		expect(mockFetch).toHaveBeenCalledWith(
			'http://localhost:8080/api/v1/courses/course%2F1/modules/module%2F1/progress',
			{
				method: 'PUT',
				headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: 'completed' })
			}
		);
	});

	it('throws the API message when updating module progress fails', async () => {
		const mockFetch = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ success: false, message: 'Progres gagal diperbarui.' }), {
				status: 422,
				headers: { 'Content-Type': 'application/json' }
			})
		);
		const source = new CourseSource(new HttpClient({ fetch: mockFetch, baseUrl: '' }));

		await expect(
			source.updateModuleProgress('course-1', 'module-1', { status: 'in_progress' })
		).rejects.toThrow('Progres gagal diperbarui.');
	});

	it('updates and returns lesson progress', async () => {
		const responseData = { success: true, message: 'Progres materi berhasil diperbarui.' };
		const mockFetch = vi.fn().mockResolvedValue(
			new Response(JSON.stringify(responseData), {
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			})
		);
		const source = new CourseSource(
			new HttpClient({ fetch: mockFetch, baseUrl: 'http://localhost:8080/api' })
		);

		await expect(
			source.updateLessonProgress('course/1', 'lesson/1', { status: 'unlocked' })
		).resolves.toEqual(responseData);
		expect(mockFetch).toHaveBeenCalledWith(
			'http://localhost:8080/api/v1/courses/course%2F1/lessons/lesson%2F1/progress',
			{
				method: 'PUT',
				headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: 'unlocked' })
			}
		);
	});

	it('throws the API message when updating lesson progress fails', async () => {
		const mockFetch = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ success: false, message: 'Progres gagal diperbarui.' }), {
				status: 422,
				headers: { 'Content-Type': 'application/json' }
			})
		);
		const source = new CourseSource(new HttpClient({ fetch: mockFetch, baseUrl: '' }));

		await expect(
			source.updateLessonProgress('course-1', 'lesson-1', { status: 'in_progress' })
		).rejects.toThrow('Progres gagal diperbarui.');
	});
});
