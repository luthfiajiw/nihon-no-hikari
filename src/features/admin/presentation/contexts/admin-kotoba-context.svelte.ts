import { createContext } from 'svelte';

export function createAdminKotobaState() {
	let notice = $state('');
	return {
		get notice() {
			return notice;
		},
		set notice(message: string) {
			notice = message;
		}
	};
}

export const [getAdminKotobaState, setAdminKotobaState] =
	createContext<ReturnType<typeof createAdminKotobaState>>();
