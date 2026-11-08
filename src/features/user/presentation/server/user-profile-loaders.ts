import { getUserProfileUseCase } from '$dependencies/user.dependency';
import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import type { UserProfileData } from '../../domain/entities/user-profile.entity';

export async function loadUserProfile(event: RequestEvent): Promise<{ profile: UserProfileData }> {
	if (!event.locals.user) {
		throw error(401, 'Silakan masuk terlebih dahulu.');
	}

	try {
		const profile = await getUserProfileUseCase.exec();
		return { profile };
	} catch (cause) {
		console.error('Failed to load user profile:', cause);
		return {
			profile: {
				id: event.locals.user.id,
				email: event.locals.user.email,
				display_name: event.locals.user.display_name,
				avatar_url: event.locals.user.avatar_url ?? null,
				role: event.locals.user.role,
				has_password: true,
				google_linked: false,
				google_email: null,
				sessions: []
			}
		};
	}
}
