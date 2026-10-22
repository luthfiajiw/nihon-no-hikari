import { z } from 'zod';

export class RequestValidationError extends Error {
	constructor(
		message: string,
		public readonly status = 400
	) {
		super(message);
		this.name = 'RequestValidationError';
	}
}

export function parseRequest<T extends z.ZodType>(schema: T, input: unknown): z.output<T> {
	const result = schema.safeParse(input);
	if (result.success) return result.data;
	const issue = result.error.issues[0];
	const status = issue.code === 'custom' && issue.params?.status === 413 ? 413 : 400;
	throw new RequestValidationError(issue.message, status);
}

// The API accepts UUIDs of any version, but resource IDs must not be nil.
export const resourceIdSchema = z
	.guid({ error: 'ID tidak valid.' })
	.refine((value) => value !== '00000000-0000-0000-0000-000000000000', 'ID tidak valid.');

export function uniqueIds(ids: string[]): boolean {
	return new Set(ids.map((id) => id.toLowerCase())).size === ids.length;
}
