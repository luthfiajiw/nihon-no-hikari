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
import {
	adminContentSchemas,
	adminReorderRequestSchema,
	changeAdminRoleRequestSchema,
	kanaTemplateInputSchema,
	kanaTemplateUploadSchema,
	previewLessonRequestSchema
} from '$features/admin/domain/schemas/admin-request.schema';
import type { AdminContentKind } from '$features/admin/domain/entities/admin.entity';
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
				return kanaTemplateUploadSchema;
			case '/api/v1/admin/lesson-content/preview':
				return previewLessonRequestSchema;
			case '/api/v1/admin/kotoba/topics':
				return createKotobaTopicSchema;
		}
		if (/^\/api\/v1\/question-sets\/[^/]+\/attempts\/[^/]+\/submit$/.test(pathname))
			return submitAttemptRequestSchema;
		if (/^\/api\/v1\/admin\/content\/(module|lesson)\/reorder$/.test(pathname))
			return adminReorderRequestSchema;
	}
	if (method === 'PUT') {
		if (/^\/api\/v1\/admin\/kotoba\/topics\/[^/]+$/.test(pathname)) return updateKotobaTopicSchema;
		if (/^\/api\/v1\/courses\/[^/]+\/modules\/[^/]+\/progress$/.test(pathname))
			return updateModuleProgressSchema;
		if (/^\/api\/v1\/lessons\/[^/]+\/progress$/.test(pathname)) return updateLessonProgressSchema;
	}
	if (method === 'PATCH') {
		if (/^\/api\/v1\/admin\/users\/[^/]+\/role$/.test(pathname))
			return changeAdminRoleRequestSchema;
		if (/^\/api\/v1\/admin\/templates\/[^/]+$/.test(pathname)) return kanaTemplateInputSchema;
	}
	const content = pathname.match(
		/^\/api\/v1\/admin\/content\/(course|module|lesson|question_set)(\/[^/]+)?$/
	);
	if (content && ((method === 'POST' && !content[2]) || (method === 'PATCH' && content[2])))
		return adminContentSchemas[content[1] as AdminContentKind];
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
