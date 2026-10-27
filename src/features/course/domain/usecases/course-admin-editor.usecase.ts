import { HttpError } from '$lib/http/http-error';
import {
	isCourseAdminContentKind,
	type CourseAdminEditorData
} from '$features/course/domain/entities/course-admin.entity';
import type { CourseAdminRepository } from '../repositories/course-admin.repository';
export class GetCourseAdminEditorUseCase {
	constructor(private readonly repository: CourseAdminRepository) {}
	async exec(kind: string, id: string, parentId: string | null): Promise<CourseAdminEditorData> {
		if (!isCourseAdminContentKind(kind)) throw new HttpError(400, 'Jenis konten tidak valid.');
		const [catalog, levels, item] = await Promise.all([
			kind === 'course' ? Promise.resolve({}) : this.repository.getAdminCatalog(),
			kind === 'course' ? this.repository.getAdminLevels() : Promise.resolve([]),
			id === 'new'
				? Promise.resolve({ data: null, draft: null })
				: this.repository.getAdminContent(kind, id)
		]);
		return { kind, id, parentId, record: item.data, draft: item.draft, catalog, levels };
	}
}
