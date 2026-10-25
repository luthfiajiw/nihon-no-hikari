import { createContext } from 'svelte';
import { createKotobaFixtures } from '../../data/admin-kotoba-fixtures';
import { cloneTopic, type AdminKotobaTopic } from '../models/admin-kotoba.model';

export function createAdminKotobaState() {
	let topics = $state(createKotobaFixtures());
	let notice = $state('');
	return {
		get topics() {
			return topics;
		},
		get notice() {
			return notice;
		},
		save(topic: AdminKotobaTopic) {
			const saved = cloneTopic(topic);
			if (saved.id === 'new') {
				saved.id = crypto.randomUUID();
				saved.createdAt = Date.now();
				topics.push(saved);
			} else {
				topics = topics.map((item) => (item.id === saved.id ? saved : item));
			}
			notice = `Topik “${saved.title}” berhasil disimpan dalam simulasi.`;
		},
		remove(id: string) {
			const topic = topics.find((item) => item.id === id);
			topics = topics.filter((item) => item.id !== id);
			notice = `Topik “${topic?.title}” dihapus dari simulasi.`;
		}
	};
}

export const [getAdminKotobaState, setAdminKotobaState] =
	createContext<ReturnType<typeof createAdminKotobaState>>();
