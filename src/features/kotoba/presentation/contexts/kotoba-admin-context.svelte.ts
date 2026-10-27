import { createContext } from 'svelte';

export function createKotobaAdminState() {
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

export const [getKotobaAdminState, setKotobaAdminState] =
	createContext<ReturnType<typeof createKotobaAdminState>>();
