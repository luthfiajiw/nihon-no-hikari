import {
	courseAdminContentSchemas,
	courseAdminReorderRequestSchema,
	courseAdminPreviewLessonRequestSchema
} from '$features/course/domain/schemas/course-admin-request.schema';
import { courseAdminContentKind } from '$features/course/data/course-admin-endpoints';
import {
	questionAdminSetContentSchema,
	questionKanaTemplateInputSchema,
	questionKanaTemplateUploadSchema
} from '$features/question/domain/schemas/question-admin-request.schema';
import { userAdminChangeRoleRequestSchema } from '$features/user/domain/schemas/user-admin-request.schema';
import type { z } from 'zod';
import {
	refreshTokenRequestSchema,
	signInRequestSchema,
	signOutRequestSchema
} from '$features/auth/domain/schemas/auth-request.schema';
import {
	updateLessonProgressSchema,
	updateModuleProgressSchema
} from '$features/course/domain/schemas/progress-request.schema';
import { submitAttemptRequestSchema } from '$features/question/domain/schemas/attempt-request.schema';
import { parseRequest, RequestValidationError } from './validation';
import {
	createKotobaTopicSchema,
	updateKotobaTopicSchema
} from '$features/kotoba/domain/schemas/kotoba-request.schema';

function requestSchema(method: string, pathname: string): z.ZodType | undefined {
	if (method === 'POST') {
		switch (pathname) {
			case '/api/v1/auth/signin':
				return signInRequestSchema;
			case '/api/v1/auth/token':
				return refreshTokenRequestSchema;
			case '/api/v1/auth/signout':
				return signOutRequestSchema;
			case '/api/v1/admin/templates':
			case '/api/v1/admin/templates/preview':
				return questionKanaTemplateUploadSchema;
			case '/api/v1/admin/lessons/preview':
				return courseAdminPreviewLessonRequestSchema;
			case '/api/v1/admin/kotoba/topics':
				return createKotobaTopicSchema;
		}
		if (/^\/api\/v1\/question-sets\/[^/]+\/attempts\/[^/]+\/submit$/.test(pathname))
			return submitAttemptRequestSchema;
		const reorder = pathname.match(/^\/api\/v1\/admin\/([^/]+)\/reorder$/);
		const reorderKind = reorder && courseAdminContentKind(reorder[1]);
		if (reorderKind === 'module' || reorderKind === 'lesson')
			return courseAdminReorderRequestSchema;
	}
	if (method === 'PUT') {
		if (/^\/api\/v1\/admin\/kotoba\/topics\/[^/]+$/.test(pathname)) return updateKotobaTopicSchema;
		if (/^\/api\/v1\/courses\/[^/]+\/modules\/[^/]+\/progress$/.test(pathname))
			return updateModuleProgressSchema;
		if (/^\/api\/v1\/lessons\/[^/]+\/progress$/.test(pathname)) return updateLessonProgressSchema;
	}
	if (method === 'PATCH') {
		if (/^\/api\/v1\/admin\/users\/[^/]+\/role$/.test(pathname))
			return userAdminChangeRoleRequestSchema;
		if (/^\/api\/v1\/admin\/templates\/[^/]+$/.test(pathname))
			return questionKanaTemplateInputSchema;
	}
	if (
		(method === 'POST' && pathname === '/api/v1/admin/question-sets') ||
		(method === 'PATCH' && /^\/api\/v1\/admin\/question-sets\/[^/]+$/.test(pathname))
	)
		return questionAdminSetContentSchema;
	const content = pathname.match(/^\/api\/v1\/admin\/([^/]+)(\/[^/]+)?$/);
	const kind = content && courseAdminContentKind(content[1]);
	if (kind && content && ((method === 'POST' && !content[2]) || (method === 'PATCH' && content[2])))
		return courseAdminContentSchemas[kind];
	return undefined;
}

export function validateApiRequestBody(
	method: string,
	pathname: string,
	body: ArrayBuffer
): ArrayBuffer {
	const schema = requestSchema(method, pathname);
	// Bodyless operations and routes outside the app's mutation contracts retain
	// their existing transport behavior. The backend validates its own API too.
	if (!schema) return body;
	let input: unknown;
	try {
		input = JSON.parse(new TextDecoder().decode(body));
	} catch {
		throw new RequestValidationError('Body request harus berupa JSON yang valid.');
	}
	const validated = parseRequest(schema, input);
	return new TextEncoder().encode(JSON.stringify(validated)).buffer;
}
