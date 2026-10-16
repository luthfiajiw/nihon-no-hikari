// Resolve fetch when called, so importing singleton dependencies is safe during SSR.
export const requestFetch: typeof fetch = (input, init) => globalThis.fetch(input, init);
