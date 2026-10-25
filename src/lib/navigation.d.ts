import type { Pathname, ResolvedPathname } from '$app/types';
import '$app/paths';

declare module '$app/paths' {
	// Fully resolved path unions are valid at runtime. Keep them callable alongside
	// SvelteKit's route-ID/params overload, whose distributed tuple rejects unions.
	export function resolve(pathname: Pathname): ResolvedPathname;
}
