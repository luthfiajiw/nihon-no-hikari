import { exampleKotobaTopics } from '$features/kotoba/data/kotoba-topics';
import { exampleKotobaTopicDetail } from '$features/kotoba/data/kotoba-topic-detail';
import schoolCover from '$lib/assets/images/kotoba-school-bg.png';
import type { AdminKotobaTopic } from '../presentation/models/admin-kotoba.model';

export function createKotobaFixtures(): AdminKotobaTopic[] {
	return exampleKotobaTopics.map((topic, index) => ({
		id: topic.id,
		title: topic.title,
		level: topic.level,
		category: topic.category,
		description: topic.description,
		exerciseCount: topic.exerciseCount,
		createdAt: topic.createdAt,
		order: index + 1,
		active: true,
		visible: true,
		cover: topic.id === 'sekolah' ? { url: schoolCover, file: null } : null,
		vocabulary:
			topic.id === 'sekolah'
				? exampleKotobaTopicDetail.vocabulary.map((word) => ({
						...word,
						example: { ...word.example },
						furigana: word.furigana.map((part) => ({ ...part })),
						audio: null
					}))
				: []
	}));
}
