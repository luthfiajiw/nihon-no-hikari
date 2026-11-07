import type { Actions, PageServerLoad } from './$types';
import { loadUserProfile } from '$features/user/presentation/server/user-profile-loaders';
import {
	updateProfile,
	changePassword,
	revokeSessions,
	requestLinkGoogleCode,
	verifyLinkGoogleCode,
	linkGoogle
} from '$features/user/presentation/server/user-profile-actions';

export const load: PageServerLoad = async (event) => {
	return await loadUserProfile(event);
};

export const actions: Actions = {
	updateProfile,
	changePassword,
	revokeSessions,
	requestLinkGoogleCode,
	verifyLinkGoogleCode,
	linkGoogle
};
