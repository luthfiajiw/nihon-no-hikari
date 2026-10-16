import type { RequestEvent } from '@sveltejs/kit';
// @ts-expect-error SvelteKit's internal request-context runner has no public type declaration.
import { with_request_store } from '@sveltejs/kit/internal/server';

// Run unit tests in the same request context SvelteKit supplies to server handlers.
export function withRequestEvent<T>(event: RequestEvent, operation: () => T): T {
	return with_request_store({ event }, operation);
}
