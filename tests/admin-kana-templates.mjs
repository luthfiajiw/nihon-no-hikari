import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';

const strokeData = {
	view_box: 109,
	strokes: [
		{
			path: 'M10 10 C20 20 30 30 40 40',
			points: Array.from({ length: 32 }, (_, i) => ({
				x: 10 + (30 * i) / 31,
				y: 10 + (30 * i) / 31
			}))
		}
	]
};

function svgFor(character) {
	const code = character.codePointAt(0).toString(16).padStart(5, '0');
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 109 109"><g id="kvg:StrokePaths_${code}"><path id="kvg:${code}-s1" d="M10 10 C20 20 30 30 40 40"/></g></svg>`;
}

// This transport fixture deliberately does not implement the real converter;
// Go tests cover geometry. It verifies UI, upload and server adapter contracts.
export function createKanaTemplateFixture() {
	const templates = [
		{
			id: randomUUID(),
			script: 'hiragana',
			character: 'あ',
			romaji: 'a',
			source_version: 'seed',
			stroke_count: 1,
			stroke_data: structuredClone(strokeData)
		}
	];
	const writes = [];
	let failNext = false;
	return {
		templates,
		writes,
		failSave() {
			failNext = true;
		},
		async handle(request, response, url) {
			const reply = (status, body) => {
				response.writeHead(status, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify(body));
			};
			const id = url.pathname.split('/templates')[1].slice(1);
			if (request.method === 'GET') {
				if (!id) {
					reply(200, {
						data: templates.map((item) => ({
							id: item.id,
							script: item.script,
							character: item.character,
							romaji: item.romaji,
							source_version: item.source_version,
							stroke_count: item.stroke_count
						}))
					});
					return;
				}
				const record = templates.find((item) => item.id === id);
				reply(
					record ? 200 : 404,
					record ? { data: record } : { error: 'Template tidak ditemukan.' }
				);
				return;
			}
			let body = '';
			for await (const chunk of request) body += chunk;
			const input = JSON.parse(body);
			const record = templates.find((item) => item.id === id);
			if (id === 'preview') {
				if (!input.svg_content?.includes('StrokePaths_')) {
					reply(400, { error: 'SVG bukan XML yang valid' });
					return;
				}
				reply(200, {
					data: { ...input, svg_content: undefined, stroke_data: strokeData, stroke_count: 1 }
				});
				return;
			}
			writes.push({ method: request.method, id, input });
			if (failNext) {
				failNext = false;
				reply(500, { error: 'Fixture: template gagal disimpan.' });
				return;
			}
			if (
				templates.some(
					(item) =>
						item.id !== id &&
						item.script === input.script &&
						item.character === input.character &&
						item.source_version === input.source_version
				)
			) {
				reply(409, { error: 'Template dengan versi sumber tersebut sudah ada.' });
				return;
			}
			if (
				record &&
				(record.script !== input.script || record.character !== input.character) &&
				!input.svg_content
			) {
				reply(400, { error: 'Unggah SVG pengganti saat karakter berubah.' });
				return;
			}
			assert(input.svg_content || record, 'New templates require the uploaded SVG');
			const next = {
				...record,
				...input,
				svg_content: undefined,
				id: record?.id ?? randomUUID(),
				stroke_data: strokeData,
				stroke_count: 1
			};
			if (record) Object.assign(record, next);
			else templates.push(next);
			reply(record ? 200 : 201, { data: next });
		}
	};
}

export async function testKanaTemplates({
	page,
	origin,
	fixture,
	navigate,
	screenshotDir,
	lessonID
}) {
	await navigate('Template Kana');
	await page.getByRole('heading', { name: 'Template Kana', exact: true }).waitFor();
	assert.equal(await page.title(), 'Template Kana | Admin - Gakkobit');
	await page.getByRole('cell', { name: 'あ', exact: true }).waitFor();
	await page.getByLabel('Filter', { exact: true }).click();
	await page.getByRole('option', { name: 'Katakana', exact: true }).click();
	await page.getByText('Template tidak ditemukan.', { exact: true }).waitFor();
	await page.getByRole('button', { name: 'Tambah Template', exact: true }).click();
	await page.getByLabel('Karakter', { exact: true }).fill('い');
	await page.getByLabel('Romaji', { exact: true }).fill('i');
	await page.getByLabel('Versi sumber', { exact: true }).fill('test');
	const upload = page.locator('input[name="svg_file"]');
	await upload.setInputFiles({
		name: 'invalid.svg',
		mimeType: 'image/svg+xml',
		buffer: Buffer.from('invalid')
	});
	await page.getByRole('button', { name: 'Pratinjau SVG', exact: true }).click();
	await page.getByRole('alert').filter({ hasText: 'SVG bukan XML' }).waitFor();
	assert.equal(fixture.templates.length, 1, 'Preview must never save a template');
	await upload.setInputFiles({
		name: '03044.svg',
		mimeType: 'image/svg+xml',
		buffer: Buffer.from(svgFor('い'))
	});
	await page.getByRole('button', { name: 'Pratinjau SVG', exact: true }).click();
	await page.getByRole('img', { name: 'Urutan goresan い' }).waitFor();
	await page.getByRole('heading', { name: 'Coba menulis', exact: true }).waitFor();
	const canvas = page.getByRole('img', { name: 'Panduan menulis い, 1 goresan', exact: true });
	await canvas.scrollIntoViewIfNeeded();
	const rect = await canvas.boundingBox();
	assert(rect);
	await page.mouse.move(rect.x + (rect.width * 10) / 109, rect.y + (rect.height * 10) / 109);
	await page.mouse.down();
	await page.mouse.move(rect.x + (rect.width * 40) / 109, rect.y + (rect.height * 40) / 109, {
		steps: 31
	});
	await page.mouse.up();
	await canvas.locator('polyline').waitFor();
	await page.getByRole('status').filter({ hasText: 'Semua goresan selesai' }).waitFor();
	fixture.failSave();
	await page.getByRole('button', { name: 'Simpan Template', exact: true }).click();
	await page.getByRole('status').filter({ hasText: 'Fixture: template gagal disimpan.' }).waitFor();
	assert.equal(await page.getByLabel('Romaji', { exact: true }).inputValue(), 'i');
	assert.equal(
		await upload.evaluate((element) => element.files[0].name),
		'03044.svg',
		'Failed save must retain selected file'
	);
	await page.getByRole('button', { name: 'Simpan Template', exact: true }).click();
	await page.waitForURL(/\/admin\/kana-templates\/(?!new)[^/]+$/);
	const created = fixture.templates.find((item) => item.character === 'い');
	assert(created);
	assert.equal(fixture.writes.at(-1).input.svg_content, svgFor('い'));
	await page.reload({ waitUntil: 'networkidle' });
	await page.getByRole('img', { name: 'Urutan goresan い' }).waitFor();
	await page.getByLabel('Romaji', { exact: true }).fill('ii');
	await page.getByRole('button', { name: 'Simpan Template', exact: true }).click();
	await page.getByRole('status').filter({ hasText: 'Template kana berhasil disimpan.' }).waitFor();
	await page.waitForLoadState('networkidle');
	assert.equal(fixture.writes.at(-1).method, 'PATCH');
	assert(
		!('svg_content' in fixture.writes.at(-1).input),
		'Metadata-only edits preserve stored geometry'
	);
	await page.getByLabel('Script', { exact: true }).click();
	await page.getByRole('option', { name: 'Katakana', exact: true }).click();
	await page.getByLabel('Karakter', { exact: true }).fill('カ');
	await page.getByLabel('Romaji', { exact: true }).fill('ka');
	assert(
		await upload.evaluate((element) => element.required),
		'Identity changes require a new SVG'
	);
	await upload.setInputFiles({
		name: '030ab.svg',
		mimeType: 'image/svg+xml',
		buffer: Buffer.from(svgFor('カ'))
	});
	await page.getByRole('button', { name: 'Pratinjau SVG', exact: true }).click();
	await page.getByRole('img', { name: 'Urutan goresan カ' }).waitFor();
	await page.screenshot({ path: join(screenshotDir, 'kana-template-editor.png'), fullPage: true });
	const editPath = new URL(page.url()).pathname;
	await Promise.all([
		page.waitForResponse(
			(response) =>
				response.request().method() === 'POST' && new URL(response.url()).pathname === editPath
		),
		page.getByRole('button', { name: 'Simpan Template', exact: true }).click()
	]);
	await page.getByRole('status').filter({ hasText: 'Template kana berhasil disimpan.' }).waitFor();
	await page.waitForLoadState('networkidle');
	assert.equal(created.character, 'カ');
	assert.equal(
		new URL(page.url()).pathname,
		`/admin/kana-templates/${created.id}`,
		'Identity edit retains UUID'
	);
	await page.setViewportSize({ width: 390, height: 844 });
	assert(
		await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
		'Kana editor fits mobile'
	);
	await page.screenshot({ path: join(screenshotDir, 'kana-template-mobile.png'), fullPage: true });
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto(`${origin}/admin/content/question_set/new?parent=${lessonID}`, {
		waitUntil: 'networkidle'
	});
	await page.getByRole('button', { name: /^Skill/ }).click();
	await page.getByRole('option', { name: 'Writing', exact: true }).click();
	await page.getByRole('button', { name: 'Tambah Soal', exact: true }).click();
	await page.getByLabel('Template kana', { exact: true }).click();
	await page.getByRole('option', { name: /katakana カ · ka \(test\)/ }).click();
	const payload = JSON.parse(await page.locator('input[name="payload"]').inputValue());
	assert.equal(
		payload.questions[0].stroke_template_id,
		created.id,
		'New template is selectable in writing questions'
	);
}
