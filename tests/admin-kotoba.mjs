import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export async function testKotoba({ page, origin, navigate, screenshotDir, mutations }) {
	const writesBefore = mutations.length;
	const cover = {
		name: 'cover.png',
		mimeType: 'image/png',
		buffer: await readFile(
			new URL('../src/lib/assets/images/kotoba-banner-bg.png', import.meta.url)
		)
	};
	const mp3 = {
		name: 'gakkou.mp3',
		mimeType: 'audio/mpeg',
		buffer: await readFile(new URL('./fixtures/kotoba-preview.mp3', import.meta.url))
	};
	const rows = page.locator('[data-topic-id]');
	const words = page.locator('[data-word-id]');
	const wordIDs = () => words.evaluateAll((nodes) => nodes.map((node) => node.dataset.wordId));
	const save = () => page.getByRole('button', { name: 'Simpan', exact: true }).click();
	const editSchool = async () => {
		await page.getByRole('button', { name: 'Edit topik Sekolah', exact: true }).click();
		await page.getByRole('heading', { name: 'Edit Topik Kotoba', exact: true }).waitFor();
	};
	const back = async () => {
		await page.getByRole('button', { name: 'Batal', exact: true }).click();
		await page.getByRole('heading', { name: 'Kotoba', exact: true }).waitFor();
	};
	await navigate('Kotoba');
	await page.getByRole('heading', { name: 'Kotoba', exact: true }).waitFor();
	const directResponse = await page.reload({ waitUntil: 'networkidle' });
	assert.equal(directResponse.status(), 200, 'Direct Kotoba requests must render without a 500');
	await page.getByRole('heading', { name: 'Kotoba', exact: true }).waitFor();
	assert.equal(await rows.count(), 8);
	assert.match(
		await rows
			.filter({ has: page.getByRole('heading', { name: 'Sekolah', exact: true }) })
			.innerText(),
		/12 kosakata/
	);
	await page.getByRole('searchbox', { name: 'Cari topik' }).fill('keluarga');
	assert.equal(await rows.count(), 1);
	await page.getByRole('searchbox', { name: 'Cari topik' }).fill('tidak-ada');
	await page.getByText('Topik tidak ditemukan', { exact: true }).waitFor();
	await page.getByRole('button', { name: 'Reset filter', exact: true }).click();
	await page.getByLabel('Filter level JLPT', { exact: true }).click();
	await page.getByRole('option', { name: 'N4', exact: true }).click();
	assert.equal(await rows.count(), 0);
	await page.getByRole('button', { name: 'Reset filter', exact: true }).click();
	await page.getByLabel('Filter status', { exact: true }).click();
	await page.getByRole('option', { name: 'Nonaktif', exact: true }).click();
	assert.equal(await rows.count(), 0);
	await page.getByRole('button', { name: 'Reset filter', exact: true }).click();
	await page.getByLabel('Urutkan topik', { exact: true }).click();
	await page.getByRole('option', { name: 'Nama A–Z', exact: true }).click();
	assert.equal(await rows.first().getAttribute('data-topic-id'), 'angka-waktu');
	await page.screenshot({ path: join(screenshotDir, 'kotoba-list.png'), fullPage: true });

	// Track object URLs across client navigation, including replaced/removed media.
	await page.evaluate(() => {
		window.__kotobaURLs = new Set();
		const create = URL.createObjectURL.bind(URL);
		const revoke = URL.revokeObjectURL.bind(URL);
		URL.createObjectURL = (blob) => {
			const url = create(blob);
			window.__kotobaURLs.add(url);
			return url;
		};
		URL.revokeObjectURL = (url) => {
			window.__kotobaURLs.delete(url);
			revoke(url);
		};
	});
	await editSchool();
	assert.equal(await words.count(), 12);
	assert.equal(
		await words.nth(8).locator('[data-furigana-preview] ruby').count(),
		1,
		'読む keeps ruby only on the kanji'
	);
	await page.getByLabel('Nama Topik', { exact: false }).fill('Perubahan batal');
	await back();
	assert.equal(
		await page.getByRole('heading', { name: 'Perubahan batal', exact: true }).count(),
		0
	);
	await editSchool();
	await page.getByRole('button', { name: 'Ciutkan kosakata 1', exact: true }).click();
	await page.getByRole('button', { name: 'Ciutkan kosakata 2', exact: true }).click();
	const originalOrder = await wordIDs();
	await page.getByRole('button', { name: 'Geser kosakata 1', exact: true }).focus();
	await page.keyboard.press('Space');
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('Enter');
	assert.deepEqual((await wordIDs()).slice(0, 2), [originalOrder[1], originalOrder[0]]);
	await page.getByRole('button', { name: 'Geser kosakata 1', exact: true }).focus();
	await page.keyboard.press('Space');
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('Escape');
	assert.deepEqual(
		(await wordIDs()).slice(0, 2),
		[originalOrder[1], originalOrder[0]],
		'Escape restores order'
	);
	await page.getByRole('button', { name: 'Duplikat kosakata 1', exact: true }).click();
	assert.equal(await words.count(), 13);
	await page.getByRole('button', { name: 'Hapus kosakata 2', exact: true }).click();
	assert.equal(await words.count(), 12);
	const beforePointer = await wordIDs();
	const handle = page.getByRole('button', { name: 'Geser kosakata 1', exact: true });
	await handle.scrollIntoViewIfNeeded();
	const source = await handle.boundingBox();
	const destination = await words.nth(2).boundingBox();
	await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
	await page.mouse.down();
	await page.mouse.move(destination.x + 20, destination.y + destination.height - 4, { steps: 8 });
	await page.locator('#dnd-action-dragged-el').waitFor({ state: 'visible' });
	await page.waitForTimeout(300);
	await page.mouse.up();
	await page.locator('#dnd-action-dragged-el').waitFor({ state: 'hidden' });
	assert.notDeepEqual(await wordIDs(), beforePointer, 'Pointer drag changes vocabulary order');
	await back();
	await editSchool();
	assert.deepEqual(
		await wordIDs(),
		originalOrder,
		'Cancel discards ordering and duplicate changes'
	);
	await page.screenshot({ path: join(screenshotDir, 'kotoba-editor.png') });
	await back();

	await page.getByRole('button', { name: 'Buat Topik', exact: true }).click();
	await page.getByRole('heading', { name: 'Buat Topik Kotoba', exact: true }).waitFor();
	await save();
	await page.getByText('Nama topik wajib diisi.', { exact: true }).waitFor();
	await page.getByText('Pilih gambar cover untuk topik ini.', { exact: true }).waitFor();
	await page.getByLabel('Nama Topik', { exact: false }).fill('Topik Simulasi');
	await page
		.getByLabel('Deskripsi Topik', { exact: false })
		.fill('Kosakata untuk mencoba form admin.');
	const word = words.first();
	await word.getByLabel('Kata Jepang (Kanji / Kana)', { exact: false }).fill('学校');
	await word.getByLabel('Hiragana / Kana', { exact: false }).fill('がっこう');
	await word.getByLabel('Romaji', { exact: false }).fill('gakkou');
	await word.getByLabel('Arti Indonesia', { exact: false }).fill('sekolah');
	await word.getByLabel('Contoh Kalimat Jepang', { exact: false }).fill('学校へ行きます。');
	await word.getByLabel('Terjemahan Indonesia', { exact: false }).fill('Saya pergi ke sekolah.');
	await page.locator('#topic-cover').setInputFiles(cover);
	await page.locator('[data-media="cover"] img').waitFor();
	await page
		.locator('#topic-cover')
		.setInputFiles({ ...cover, buffer: Buffer.alloc(2 * 1024 * 1024 + 1) });
	await page.getByText('Ukuran gambar maksimal 2 MiB.', { exact: true }).waitFor();
	assert.equal(
		await page.locator('[data-media="cover"] img').count(),
		1,
		'Invalid replacement retains cover'
	);
	await page.locator('#topic-cover').setInputFiles({
		name: 'broken.png',
		mimeType: 'image/png',
		buffer: Buffer.from('invalid png')
	});
	await page.getByText('Gambar tidak dapat dibaca. Pilih gambar lain.', { exact: true }).waitFor();
	assert.equal(await page.locator('[data-media="cover"] img').count(), 1);
	await page.getByRole('button', { name: 'Hapus Cover / Banner Gambar *', exact: true }).click();
	assert.equal(await page.locator('[data-media="cover"] img').count(), 0);
	await page.locator('#topic-cover').setInputFiles(cover);
	await page.locator('[data-media="cover"] img').waitFor();
	await word.getByRole('button', { name: 'Atur Furigana', exact: true }).click();
	await word.getByLabel('Teks 1', { exact: true }).fill('学');
	await save();
	await word
		.getByText('Gabungan teks segmen harus sama dengan kata Jepang.', { exact: true })
		.waitFor();
	await word.getByRole('button', { name: 'Gunakan bacaan utuh', exact: true }).click();
	await word.locator('input[type="file"]').setInputFiles(mp3);
	await word.getByText('gakkou.mp3', { exact: true }).waitFor();
	await word
		.locator('input[type="file"]')
		.setInputFiles({ ...mp3, name: 'wrong.wav', mimeType: 'audio/wav' });
	await word.getByText('Gunakan audio berformat MP3.', { exact: true }).waitFor();
	assert.equal(await word.locator('audio').count(), 1, 'Invalid replacement retains audio');
	await word
		.locator('input[type="file"]')
		.setInputFiles({ ...mp3, buffer: Buffer.from('unreadable audio') });
	await word.getByText('Audio tidak dapat dibaca. Pilih file MP3 lain.', { exact: true }).waitFor();
	assert.equal(
		await word.getByText('gakkou.mp3', { exact: true }).count(),
		1,
		'Unreadable replacement retains the playable file'
	);
	await word
		.locator('input[type="file"]')
		.setInputFiles({ ...mp3, buffer: Buffer.alloc(1024 * 1024 + 1) });
	await word.getByText('Ukuran audio maksimal 1 MiB.', { exact: true }).waitFor();
	await word.locator('input[type="file"]').setInputFiles(mp3);
	await page.getByRole('button', { name: 'Duplikat kosakata 1', exact: true }).click();
	assert.equal(await words.count(), 2);
	await page.locator('audio').evaluateAll(async (audio) => {
		audio.forEach((item) => {
			item.muted = true;
		});
		await audio[0].play();
		await audio[1].play();
	});
	assert(
		await page
			.locator('audio')
			.first()
			.evaluate((audio) => audio.paused),
		'Playing second audio pauses first'
	);
	await page.getByRole('button', { name: 'Hapus kosakata 2', exact: true }).click();
	await page.getByLabel('Aktif', { exact: true }).check();
	await page.getByLabel('Tampilkan di halaman siswa', { exact: true }).uncheck();
	assert.match(await page.locator('[data-topic-preview]').innerText(), /Topik Simulasi/);
	assert.match(await page.locator('[data-topic-preview]').innerText(), /1 kosakata/);
	await page.setViewportSize({ width: 390, height: 844 });
	await page.screenshot({ path: join(screenshotDir, 'kotoba-form-mobile.png'), fullPage: true });
	assert(
		await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
		'Mobile editor has no horizontal overflow'
	);
	await save();
	await page.getByRole('heading', { name: 'Kotoba', exact: true }).waitFor();
	assert.equal(await rows.count(), 9);
	const savedRow = rows.filter({
		has: page.getByRole('heading', { name: 'Topik Simulasi', exact: true })
	});
	assert.match(await savedRow.innerText(), /Disembunyikan/);
	await savedRow.getByRole('button', { name: 'Edit topik Topik Simulasi', exact: true }).click();
	await page.getByText('gakkou.mp3', { exact: true }).waitFor();
	assert.equal(await page.getByLabel('Aktif', { exact: true }).isChecked(), true);
	await page.getByRole('button', { name: 'Hapus Audio kosakata 1', exact: true }).click();
	assert.equal(await page.locator('audio').count(), 0);
	await page.getByLabel('Nama Topik', { exact: false }).fill('Topik Diperbarui');
	await save();
	await page.getByRole('heading', { name: 'Topik Diperbarui', exact: true }).waitFor();
	await page.getByRole('button', { name: 'Hapus topik Topik Diperbarui', exact: true }).click();
	await page.getByRole('dialog').getByRole('button', { name: 'Batal', exact: true }).click();
	assert.equal(await rows.count(), 9);
	await page.getByRole('button', { name: 'Hapus topik Topik Diperbarui', exact: true }).click();
	await page.getByRole('dialog').getByRole('button', { name: 'Hapus Topik', exact: true }).click();
	assert.equal(await rows.count(), 8);
	assert(
		await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
		'Mobile list has no horizontal overflow'
	);
	assert.equal(
		await page.evaluate(() => window.__kotobaURLs.size),
		0,
		'All uploaded-media object URLs are released after deletion'
	);
	await page.screenshot({ path: join(screenshotDir, 'kotoba-list-mobile.png'), fullPage: true });
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.getByRole('button', { name: 'Hapus topik Sekolah', exact: true }).click();
	await page.getByRole('dialog').getByRole('button', { name: 'Hapus Topik', exact: true }).click();
	assert.equal(await rows.count(), 7);
	await page.reload({ waitUntil: 'networkidle' });
	assert.equal(await rows.count(), 8, 'Refresh resets simulation');
	await page.getByRole('button', { name: 'Hapus topik Sekolah', exact: true }).click();
	await page.getByRole('dialog').getByRole('button', { name: 'Hapus Topik', exact: true }).click();
	await navigate('Kursus & Materi');
	await page.getByRole('heading', { name: 'Kursus & Materi', exact: true }).waitFor();
	await navigate('Kotoba');
	await page.getByRole('heading', { name: 'Kotoba', exact: true }).waitFor();
	assert.equal(await rows.count(), 8, 'Leaving the subtree resets simulation');
	await page.goto(`${origin}/admin/kotoba/unknown-topic`, { waitUntil: 'networkidle' });
	await page.getByRole('heading', { name: 'Topik tidak ditemukan', exact: true }).waitFor();
	assert.equal(mutations.length, writesBefore, 'Kotoba simulation never writes to the API');
	// Verify the existing protected/admin layout still guards the new routes.
	const anonymous = await page.context().browser().newContext();
	try {
		const anonymousPage = await anonymous.newPage();
		await anonymousPage.goto(`${origin}/admin/kotoba`, {
			waitUntil: 'networkidle',
			timeout: 120000
		});
		assert.equal(new URL(anonymousPage.url()).pathname, '/signin');
	} finally {
		await anonymous.close();
	}
}
