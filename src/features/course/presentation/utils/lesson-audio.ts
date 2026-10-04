const AUDIO_FILE_EXTENSION = /\.[a-z0-9]+$/i;

export function resolveLessonAudioUrl(audioValue: string, baseUrl: string): string | null {
	const normalizedBaseUrl = baseUrl.trim().replace(/\/+$/, '');
	const normalizedAudioValue = audioValue.trim().replace(/^\/+/, '');

	if (!normalizedBaseUrl || !normalizedAudioValue) return null;

	const pathSegments = normalizedAudioValue.split('/');
	if (pathSegments.some((segment) => !segment || segment === '.' || segment === '..')) return null;

	const audioPath = AUDIO_FILE_EXTENSION.test(normalizedAudioValue)
		? normalizedAudioValue
		: `${normalizedAudioValue}.mp3`;
	const encodedAudioPath = audioPath
		.split('/')
		.map((segment) => encodeURIComponent(segment))
		.join('/');

	return `${normalizedBaseUrl}/${encodedAudioPath}`;
}
