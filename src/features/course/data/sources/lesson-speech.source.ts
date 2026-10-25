import { requestFetch } from '#request-fetch';

export interface LessonSpeechToken {
	token: string;
	region: string;
	expires_at: string;
}

export async function getLessonSpeechToken(
	lessonId: string,
	signal: AbortSignal
): Promise<LessonSpeechToken> {
	const response = await requestFetch(
		`/api/v1/lessons/${encodeURIComponent(lessonId)}/speech-token`,
		{
			method: 'POST',
			cache: 'no-store',
			headers: { Accept: 'application/json' },
			signal
		}
	);
	const body = await response.json().catch(() => null);
	if (!response.ok || !body?.success) {
		throw new Error(body?.error || 'Gagal menyiapkan suara. Silakan coba lagi.');
	}
	const data = body.data as LessonSpeechToken | undefined;
	if (!data?.token || !data.region || !Number.isFinite(Date.parse(data.expires_at))) {
		throw new Error('Respons layanan suara tidak valid.');
	}
	return data;
}
