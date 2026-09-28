import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => {
	if (!locals.session || !locals.user) {
		redirect(303, '/signin');
	}

	return {
		user: locals.user
	};
};
