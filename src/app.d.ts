import type { AuthUser, StoredAuthSession } from '$features/auth/domain/entities/auth.entity';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: AuthUser | null;
			session: StoredAuthSession | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
