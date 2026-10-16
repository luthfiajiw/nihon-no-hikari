import { getRequestEvent } from '$app/server';

// Keep only this dispatcher in singletons, never a user's RequestEvent or fetch.
export const requestFetch: typeof fetch = (input, init) => getRequestEvent().fetch(input, init);
