import { HttpError } from '$lib/http/http-error';
import {
	isCourseAdminContentKind,
	type CourseAdminContentAction,
	type CourseAdminContentRecord,
	type CourseAdminMutationResult
} from '$features/course/domain/entities/course-admin.entity';
import type { CourseAdminRepository } from '../repositories/course-admin.repository';
export class ManageCourseAdminContentUseCase {
	constructor(private readonly repository: CourseAdminRepository) {}
	async exec(
		action: CourseAdminContentAction,
		kind: string,
		id: string,
		payload?: CourseAdminContentRecord
	): Promise<CourseAdminMutationResult> {
		if (!isCourseAdminContentKind(kind)) throw new HttpError(400, 'Jenis konten tidak valid.');
		if (action === 'save') {
			if (payload === undefined) throw new HttpError(400, 'Form tidak lengkap.');
			return this.repository.saveAdminContent(kind, id === 'new' ? null : id, payload);
		}
		if (id === 'new')
			throw new HttpError(
				400,
				action === 'publish' ? 'Simpan draft terlebih dahulu.' : 'Konten tidak valid.'
			);
		if (action === 'publish') return this.repository.publishAdminContent(kind, id);
		if (action === 'remove') await this.repository.removeAdminContent(kind, id);
		else await this.repository.restoreAdminContent(kind, id);
		return {};
	}
}
