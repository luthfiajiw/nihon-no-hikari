import type { ListCourseResponse } from '../../domain/entities/course.entity';
import { HttpClient } from '$lib/http-client';

export class CourseSource {
	constructor(private readonly httpClient: HttpClient) {}

	async getList(): Promise<ListCourseResponse> {
		const response = await this.httpClient.request<ListCourseResponse>('/v1/courses', {
			method: 'GET',
			headers: {
				Accept: 'application/json'
			}
		});

		if (!response.ok) {
			throw new Error(response.data?.message || 'Gagal mengambil daftar kursus.');
		}

		return response.data;
	}
}
