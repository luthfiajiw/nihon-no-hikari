import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export function createKotobaFixture(mutations) {
	const school = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
	const coverId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
	const word = {
		id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
		kanji: '学校',
		hiragana: 'がっこう',
		furigana: [{ text: '学校', reading: 'がっこう' }],
		romaji: 'gakkou',
		translation: 'sekolah',
		example: { japanese: '学校へ行きます。', indonesian: 'Saya pergi ke sekolah.' },
		type: 'Kata Benda',
		order_index: 1,
		audio_media_id: null
	};
	const topics = new Map([
		[
			school,
			{
				id: school,
				title: 'Sekolah',
				description: 'Kosakata sekolah.',
				level: 'N5',
				category: 'Dasar',
				order_index: 1,
				is_active: true,
				is_visible: true,
				cover_media_id: coverId,
				version: 1,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
				vocabulary: [word]
			}
		]
	]);
	const files = new Map();
	const fixture = {
		topics,
		files,
		failNextSave: false,
		conflictNextSave: false,
		uploads: 0,
		downloads: 0,
		audioDownloads: 0,
		reads: 0,
		school,
		async handle(request, response, url) {
			const json = (status, data) => {
				response.writeHead(status, {
					'Content-Type': 'application/json',
					'Cache-Control': 'no-store'
				});
				response.end(JSON.stringify(data));
			};
			const signed = (id) =>
				id ? `${url.origin}/storage/v1/object/sign/${id}?token=fixture` : null;
			const expiry = () => new Date(Date.now() + 900000).toISOString();
			const project = (topic, admin, detail = false) => {
				const result = {
					...topic,
					cover_url: signed(topic.cover_media_id),
					media_urls_expires_at: expiry(),
					vocabulary_count: topic.vocabulary.length,
					exercise_count: 0
				};
				if (detail)
					result.vocabulary = topic.vocabulary.map((item) => ({
						...item,
						audio_url: signed(item.audio_media_id),
						...(!admin ? { audio_media_id: undefined } : {})
					}));
				else delete result.vocabulary;
				if (!admin)
					for (const key of ['version', 'is_active', 'is_visible', 'cover_media_id'])
						delete result[key];
				return result;
			};
			if (url.pathname.startsWith('/storage/')) {
				if (
					!url.pathname.startsWith('/storage/v1/object/sign/') ||
					url.searchParams.get('token') !== 'fixture'
				)
					return json(403, { error: 'private' });
				const id = url.pathname.split('/').at(-1);
				const media =
					files.get(id) ??
					(id === coverId
						? {
								bytes: await readFile(
									new URL('../src/lib/assets/images/kotoba-banner-bg.png', import.meta.url)
								),
								mime: 'image/png'
							}
						: null);
				if (!media) return json(404, { error: 'missing media' });
				fixture.downloads++;
				if (media.mime === 'audio/mpeg') fixture.audioDownloads++;
				response.writeHead(200, {
					'Content-Type': media.mime,
					'Access-Control-Allow-Origin': '*',
					'Accept-Ranges': 'bytes',
					'Cache-Control': 'no-store'
				});
				response.end(media.bytes);
				return;
			}
			const admin = url.pathname.startsWith('/api/v1/admin/');
			if (request.method === 'POST' && url.pathname.endsWith('/media')) {
				const chunks = [];
				for await (const chunk of request) chunks.push(chunk);
				const form = await new Request(url, {
					method: 'POST',
					headers: { 'Content-Type': request.headers['content-type'] },
					body: Buffer.concat(chunks)
				}).formData();
				const file = form.get('file');
				const kind = form.get('kind');
				const id = randomUUID();
				assert(file instanceof File);
				assert(['cover', 'audio'].includes(kind));
				files.set(id, { bytes: Buffer.from(await file.arrayBuffer()), mime: file.type });
				fixture.uploads++;
				mutations.push({ path: url.pathname, method: 'POST', payload: { kind, name: file.name } });
				return json(201, {
					success: true,
					data: {
						id,
						kind,
						url: signed(id),
						url_expires_at: expiry(),
						size_bytes: file.size,
						mime_type: file.type
					}
				});
			}
			const id = url.pathname.match(/\/topics\/([^/]+)$/)?.[1];
			const existing = topics.get(id);
			if (request.method === 'GET') {
				fixture.reads++;
				if (id)
					return !existing || (!admin && !existing.is_active)
						? json(404, { success: false, error: 'Topik tidak ditemukan.' })
						: json(200, { success: true, data: project(existing, admin, true) });
				return json(200, {
					success: true,
					data: [...topics.values()]
						.filter((topic) => admin || (topic.is_active && topic.is_visible))
						.map((topic) => project(topic, admin))
				});
			}
			if (request.method === 'DELETE') {
				topics.delete(id);
				mutations.push({ path: url.pathname, method: 'DELETE' });
				return json(200, { success: true });
			}
			let body = '';
			for await (const chunk of request) body += chunk;
			const input = JSON.parse(body);
			if (fixture.failNextSave) {
				fixture.failNextSave = false;
				return json(500, { success: false, error: 'Fixture: simpan gagal.' });
			}
			if (fixture.conflictNextSave || (existing && input.version !== existing.version)) {
				fixture.conflictNextSave = false;
				return json(409, { success: false, error: 'Topik sudah diubah admin lain.' });
			}
			const topicId = id ?? randomUUID();
			const now = new Date().toISOString();
			const saved = {
				...input,
				id: topicId,
				version: (existing?.version ?? 0) + 1,
				created_at: existing?.created_at ?? now,
				updated_at: now,
				vocabulary: input.vocabulary.map((item, index) => ({
					...item,
					id: item.id ?? randomUUID(),
					order_index: index + 1
				}))
			};
			topics.set(topicId, saved);
			mutations.push({ path: url.pathname, method: request.method, payload: input });
			return json(existing ? 200 : 201, { success: true, data: project(saved, true, true) });
		}
	};
	return fixture;
}

export async function testKotoba({ page, origin, navigate, screenshotDir, fixture }) {
	const rows = page.locator('[data-topic-id]');
	await navigate('Kotoba');
	await page.getByRole('heading', { name: 'Kotoba', exact: true }).waitFor();
	assert.equal(await rows.count(), 1);
	await page.getByRole('button', { name: 'Edit topik Sekolah', exact: true }).click();
	await page.getByRole('heading', { name: 'Edit Topik Kotoba' }).waitFor();
	await page.getByLabel('Nama Topik', { exact: false }).fill('Batal mengubah');
	await page.getByRole('button', { name: 'Batal', exact: true }).click();
	assert.equal(fixture.topics.get(fixture.school).title, 'Sekolah');
	await page.getByRole('button', { name: 'Buat Topik', exact: true }).click();
	await page.getByRole('button', { name: 'Simpan', exact: true }).click();
	await page.getByText('Nama topik wajib diisi.', { exact: true }).waitFor();
	await page.getByLabel('Nama Topik', { exact: false }).fill('Topik API');
	await page.getByLabel('Deskripsi Topik', { exact: false }).fill('Topik tersimpan di backend.');
	const cover = {
		name: 'cover.png',
		mimeType: 'image/png',
		buffer: await readFile(
			new URL('../src/lib/assets/images/kotoba-banner-bg.png', import.meta.url)
		)
	};
	await page.evaluate(() => {
		const decode = Image.prototype.decode;
		Image.prototype.decode = function () {
			return new Promise((resolve, reject) => {
				window.__releaseKotobaCover = () => {
					Image.prototype.decode = decode;
					decode.call(this).then(resolve, reject);
				};
			});
		};
	});
	await page.locator('[data-media="cover"] input[type="file"]').setInputFiles(cover);
	const word = page.locator('[data-word-id]').first();
	for (const [field, value] of Object.entries({
		kanji: '学校',
		hiragana: 'がっこう',
		romaji: 'gakkou',
		translation: 'sekolah',
		japanese: '学校へ行きます。',
		indonesian: 'Pergi ke sekolah.'
	}))
		await word.locator(`input[id$="-${field}"],textarea[id$="-${field}"]`).fill(value);
	await word.locator('input[type="file"]').setInputFiles({
		name: 'gakkou.mp3',
		mimeType: 'audio/mpeg',
		buffer: await readFile(new URL('./fixtures/kotoba-preview.mp3', import.meta.url))
	});
	await word.getByText('gakkou.mp3', { exact: true }).waitFor();
	await page.getByLabel('Aktif', { exact: true }).check();
	await page.getByRole('button', { name: 'Simpan', exact: true }).click();
	await page.getByText('Tunggu hingga file selesai diperiksa.', { exact: true }).waitFor();
	assert.equal(fixture.uploads, 0, 'The editor must not submit while media validation is pending');
	await page.evaluate(() => window.__releaseKotobaCover());
	await page.locator('[data-media="cover"]').getByText('cover.png', { exact: true }).waitFor();
	fixture.failNextSave = true;
	await page.getByRole('button', { name: 'Simpan', exact: true }).click();
	await page.getByText('Fixture: simpan gagal.', { exact: true }).waitFor();
	assert.equal(await page.getByLabel('Nama Topik', { exact: false }).inputValue(), 'Topik API');
	assert.equal(fixture.uploads, 2);
	await page.getByRole('button', { name: 'Simpan', exact: true }).click();
	await page.getByRole('heading', { name: 'Kotoba', exact: true }).waitFor();
	assert.equal(fixture.uploads, 2, 'Retry must reuse successful uploads');
	await page.reload({ waitUntil: 'networkidle' });
	assert.equal(await rows.count(), 2, 'Created topics survive reload');
	await page.getByRole('button', { name: 'Edit topik Topik API', exact: true }).click();
	await page.getByRole('heading', { name: 'Edit Topik Kotoba' }).waitFor();
	const topicId = [...fixture.topics.values()].find((topic) => topic.title === 'Topik API').id;
	const originalWord = fixture.topics.get(topicId).vocabulary[0].id;
	await page.getByRole('button', { name: 'Duplikat kosakata 1', exact: true }).click();
	const handle = page.getByRole('button', { name: 'Geser kosakata 2', exact: true });
	await handle.focus();
	await page.keyboard.press('Space');
	await page.keyboard.press('ArrowUp');
	await page.keyboard.press('Enter');
	fixture.conflictNextSave = true;
	await page.getByRole('button', { name: 'Simpan', exact: true }).click();
	await page.getByRole('alert').filter({ hasText: 'Topik sudah diubah admin lain.' }).waitFor();
	assert.equal(
		await page.locator('[data-word-id]').count(),
		2,
		'Conflict preserves the edited words'
	);
	await page.getByRole('button', { name: 'Simpan', exact: true }).click();
	await page.getByRole('heading', { name: 'Kotoba', exact: true }).waitFor();
	assert.equal(
		fixture.topics.get(topicId).vocabulary[1].id,
		originalWord,
		'Reordering keeps persisted IDs and creates copied words'
	);
	assert.equal(fixture.uploads, 2, 'Duplicated persisted media is shared');
	await page.goto(`${origin}/kotoba/${topicId}`, { waitUntil: 'networkidle' });
	await page.getByRole('heading', { name: 'Topik API', exact: true }).waitFor();
	const audioResponse = page.waitForResponse(
		(response) =>
			response.url().includes('/storage/v1/object/sign/') &&
			response.headers()['content-type'] === 'audio/mpeg'
	);
	await page.getByRole('button', { name: 'Putar Semua', exact: true }).click();
	assert.equal((await audioResponse).status(), 200);
	await page.getByRole('button', { name: 'Putar Semua', exact: true }).waitFor();
	assert(fixture.audioDownloads > 0, 'Uploaded MP3 is requested during playback');
	assert(fixture.downloads > 0, 'Student cover/audio must use private signed URLs');
	await page.goto(`${origin}/admin/kotoba`, { waitUntil: 'networkidle' });
	await page.setViewportSize({ width: 390, height: 844 });
	assert(
		await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
		'API topic list fits mobile'
	);
	await page.screenshot({ path: join(screenshotDir, 'kotoba-api-mobile.png'), fullPage: true });
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.getByRole('button', { name: 'Hapus topik Topik API', exact: true }).click();
	await page.getByRole('button', { name: 'Hapus Topik', exact: true }).click();
	await page.getByRole('dialog').waitFor({ state: 'hidden' });
	await page.reload({ waitUntil: 'networkidle' });
	assert.equal(await rows.count(), 1, 'Deletion survives reload');
}
