// Browser regression test with an isolated API fixture; never connects to the real database.
import assert from 'node:assert/strict';
import { createCipheriv, createHash, randomBytes } from 'node:crypto';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdir, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { testCourseReorder } from './admin-course-reorder.mjs';
import { lessonHTMLValue, testLessonEditor, waitForLessonHTML } from './admin-lesson-editor.mjs';

const course = {
	id: '11111111-1111-4111-8111-111111111111',
	level_id: '55555555-5555-4555-8555-555555555555',
	title: 'Bahasa Jepang Dasar N5',
	slug: 'n5-dasar',
	description: 'Bangun fondasi bahasa Jepang melalui huruf, kosakata, dan tata bahasa.',
	is_published: true,
	module_count: 3,
	lesson_count: 2
};
const modules = [
	{
		id: '22222222-2222-4222-8222-222222222222',
		course_id: course.id,
		title: 'Hiragana',
		slug: 'hiragana',
		is_published: true,
		is_entry: true,
		module_prerequisites: [],
		order_index: 0
	},
	{
		id: '66666666-6666-4666-8666-666666666666',
		course_id: course.id,
		title: 'Katakana',
		slug: 'katakana',
		is_published: false,
		is_entry: false,
		module_prerequisites: [],
		order_index: 1
	},
	{
		id: '88888888-8888-4888-8888-888888888888',
		course_id: course.id,
		title: 'Kanji',
		slug: 'kanji',
		is_published: false,
		is_entry: false,
		module_prerequisites: [],
		order_index: 2
	}
];
const lessons = ['Baris A (あ)', 'Baris KA (か)'].map((title, index) => ({
	id: `33333333-3333-4333-8333-33333333333${index}`,
	module_id: modules[0].id,
	title,
	slug: `baris-${index}`,
	is_published: true,
	is_entry: index === 0,
	lesson_prerequisites: index === 0 ? [] : ['33333333-3333-4333-8333-333333333330'],
	order_index: index,
	content: {
		content: index === 0 ? '<p>Belajar hiragana.</p>' : '<p>\r\n  Belajar hiragana.\r\n</p>',
		tips: ''
	}
}));
const set = {
	id: '44444444-4444-4444-8444-444444444444',
	title: 'Membaca Hiragana',
	kind: 'practice',
	skill: 'reading',
	lesson_id: lessons[0].id,
	module_id: null,
	passing_score: 80,
	version: 1,
	is_published: false,
	questions: []
};
const secret = randomBytes(32).toString('hex');
const port = Number(process.env.ADMIN_SMOKE_PORT ?? 4179);
const apiPort = port + 1;
const origin = `http://127.0.0.1:${port}`;
const screenshotDir = join(tmpdir(), 'nnh-admin-smoke');
let backendRequests = [];
const mutations = [];
const transportViolations = [];
const managedUser = {
	id: '77777777-7777-4777-8777-777777777777',
	email: 'student@example.test',
	display_name: 'Siswa Fixture',
	role: 'User'
};
const drafts = new Map();
let mutationGate = null;
let failNextMutation = false;
const api = createServer(async (request, response) => {
	if (request.headers.authorization !== 'Bearer fixture')
		transportViolations.push('Missing admin bearer');
	if (request.headers.cookie) transportViolations.push('App cookie reached upstream');
	const url = new URL(request.url, `http://127.0.0.1:${apiPort}`);
	backendRequests.push(url.pathname + url.search);
	await new Promise((resolve) => setTimeout(resolve, 150));
	if (request.method !== 'GET') {
		if (mutationGate) await mutationGate;
		let body = '';
		for await (const chunk of request) body += chunk;
		const payload = body ? JSON.parse(body) : null;
		mutations.push({ path: url.pathname, method: request.method, payload });
		if (failNextMutation) {
			failNextMutation = false;
			response.writeHead(500, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify({ error: 'Fixture: operasi gagal. Silakan coba lagi.' }));
			return;
		}
		const resource = [course, ...modules, ...lessons, set].find((item) =>
			url.pathname.split('/').includes(item.id)
		);
		let result = { success: true };
		if (url.pathname.endsWith('/reorder')) {
			const kind = url.pathname.split('/').at(-2);
			const parentField = kind === 'module' ? 'course_id' : 'module_id';
			const siblings = (kind === 'module' ? modules : lessons).filter(
				(item) => item[parentField] === payload.parent_id
			);
			assert.deepEqual(new Set(payload.ordered_ids), new Set(siblings.map((item) => item.id)));
			for (const item of siblings) {
				item.order_index = payload.ordered_ids.indexOf(item.id);
				const draft = drafts.get(item.id);
				if (draft?.[parentField] === payload.parent_id) draft.order_index = item.order_index;
			}
		} else if (url.pathname.endsWith('/lesson-content/preview')) result.data = payload.content;
		else if (url.pathname.endsWith('/role')) managedUser.role = payload.role;
		else if (url.pathname.endsWith('/publish')) {
			Object.assign(resource, drafts.get(resource.id) ?? {}, { is_published: true });
			drafts.delete(resource.id);
			result.id = resource.id;
		} else if (url.pathname.endsWith('/restore')) {
			course.archived_at = null;
			course.is_published = false;
		} else if (request.method === 'DELETE') course.archived_at = new Date().toISOString();
		else if (request.method === 'PATCH') {
			if (resource.is_published) drafts.set(resource.id, payload);
			else Object.assign(resource, payload);
		} else if (request.method === 'POST') result.id = course.id;
		response.writeHead(200, { 'Content-Type': 'application/json' });
		response.end(JSON.stringify(result));
		return;
	}
	let data;
	if (url.pathname.endsWith('/me')) data = { role: 'Admin' };
	else if (url.pathname.endsWith('/users')) data = [managedUser];
	else if (url.pathname.endsWith('/catalog'))
		data = {
			courses: [course],
			modules: [...modules].sort((a, b) => a.order_index - b.order_index),
			lessons: [...lessons]
				.sort((a, b) => a.order_index - b.order_index)
				.map((lesson) => {
					const summary = { ...lesson };
					delete summary.content;
					return summary;
				}),
			question_sets: [set]
		};
	else if (url.pathname.endsWith('/levels')) data = [{ id: course.level_id, name: 'N5' }];
	else if (url.pathname.endsWith('/templates')) data = [];
	else if (url.pathname.endsWith('/content/course')) data = [course];
	else if (url.pathname.endsWith('/content/question_set')) data = [set];
	else
		data = [course, ...modules, ...lessons, set].find((item) =>
			url.pathname.endsWith(`/${item.id}`)
		);
	response.writeHead(data ? 200 : 404, { 'Content-Type': 'application/json' });
	response.end(
		JSON.stringify({ success: Boolean(data), data, draft: drafts.get(data?.id) ?? null })
	);
});
await new Promise((resolve, reject) => {
	api.once('error', reject);
	api.listen(apiPort, '127.0.0.1', resolve);
});
const vite = spawn(
	process.execPath,
	[
		'node_modules/vite/bin/vite.js',
		...(process.env.ADMIN_SMOKE_PREVIEW ? ['preview'] : []),
		'--host',
		'127.0.0.1',
		'--port',
		String(port),
		'--strictPort'
	],
	{
		cwd: process.cwd(),
		windowsHide: true,
		env: { ...process.env, AUTH_SECRET: secret, API_BASE_URL: `http://127.0.0.1:${apiPort}/api` },
		stdio: ['ignore', 'pipe', 'pipe']
	}
);
let serverLog = '';
vite.stdout.on('data', (chunk) => {
	serverLog = (serverLog + chunk).slice(-12000);
	if (process.env.ADMIN_SMOKE_DEBUG) process.stdout.write(chunk);
});
vite.stderr.on('data', (chunk) => {
	serverLog = (serverLog + chunk).slice(-12000);
	if (process.env.ADMIN_SMOKE_DEBUG) process.stderr.write(chunk);
});
let browser;
let page;
const errors = [];
async function clickAdminNavigation(name) {
	const target = page.getByRole('button', { name, exact: true });
	if (!(await target.isVisible()))
		await page.getByRole('button', { name: 'Toggle Sidebar', exact: true }).click();
	await target.click();
}
async function submitContentWithLoading(action) {
	const saveButton = page.getByRole('button', { name: 'Simpan Draft', exact: true });
	const publishButton = page.locator('form[action="?/publish"] button[type="submit"]');
	const activeButton = action === 'save' ? saveButton : publishButton;
	const countBefore = mutations.length;
	let release;
	mutationGate = new Promise((resolve) => {
		release = resolve;
	});
	try {
		await activeButton.click();
		await page.locator(`form[action="?/${action}"] button[aria-busy="true"]`).waitFor();
		assert(await saveButton.isDisabled(), 'Save must be disabled during submission');
		assert(await publishButton.isDisabled(), 'Publish must be disabled during submission');
		assert.equal(
			await activeButton.locator('svg.animate-spin').count(),
			1,
			'Active button shows the shared loader'
		);
		// Even programmatic submissions cannot send a second request while one is pending.
		await page.locator(`form[action="?/${action}"]`).evaluate((form) => form.requestSubmit());
	} finally {
		release();
		mutationGate = null;
	}
	await page.waitForFunction(() => {
		const save = document.querySelector('form[action="?/save"] button[type="submit"]');
		const publish = document.querySelector('form[action="?/publish"] button[type="submit"]');
		return (
			save &&
			publish &&
			!save.disabled &&
			!publish.disabled &&
			!document.querySelector('button[aria-busy="true"]')
		);
	});
	assert.equal(mutations.length, countBefore + 1, 'Only one mutation is sent');
}
try {
	let ready = false;
	const startupDeadline = Date.now() + 120000;
	while (Date.now() < startupDeadline) {
		if (vite.exitCode !== null) throw new Error(`Vite exited: ${serverLog}`);
		try {
			await fetch(`${origin}/signin`, { signal: AbortSignal.timeout(5000) });
			ready = true;
			break;
		} catch {
			await new Promise((resolve) => setTimeout(resolve, 500));
		}
	}
	assert(ready, 'Vite must start');
	browser = await chromium.launch({
		headless: true,
		...(process.env.ADMIN_SMOKE_CHANNEL ? { channel: process.env.ADMIN_SMOKE_CHANNEL } : {})
	});
	const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
	const iv = randomBytes(12);
	const cipher = createCipheriv('aes-256-gcm', createHash('sha256').update(secret).digest(), iv);
	const expiry = new Date(Date.now() + 3600000).toISOString();
	const state = {
		version: 1,
		user: {
			id: 'admin-fixture',
			email: 'admin@example.test',
			display_name: 'Admin',
			role: 'Admin'
		},
		session: {
			id: 'fixture',
			accessToken: 'fixture',
			refreshToken: 'fixture',
			accessTokenExpiresAt: expiry,
			refreshTokenExpiresAt: expiry
		}
	};
	const encrypted = Buffer.concat([cipher.update(JSON.stringify(state)), cipher.final()]);
	await context.addCookies([
		{
			name: 'nnh.auth',
			value: Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString('base64url'),
			url: origin
		}
	]);
	page = await context.newPage();
	page.setDefaultTimeout(60000);
	page.on('pageerror', (error) => errors.push(error.message));
	page.on('request', (request) => {
		const url = new URL(request.url());
		if (url.port === String(apiPort)) transportViolations.push('Browser bypassed proxy');
		if (
			url.origin === origin &&
			url.pathname.startsWith('/api/') &&
			request.headers().authorization
		)
			transportViolations.push('Browser supplied bearer');
	});
	await page.goto(`${origin}/admin/courses`, { waitUntil: 'networkidle', timeout: 120000 });
	await page.getByRole('button', { name: 'Lihat Materi', exact: true }).waitFor();
	assert.equal(await page.title(), 'Kursus & Materi | Admin - Nihongo no Hikari');
	assert.equal(
		await page.locator('a[href]').count(),
		0,
		'Admin must use clickable buttons for navigation'
	);
	await page.getByRole('button', { name: 'Draft', exact: true }).click();
	await page.getByText('Kursus tidak ditemukan', { exact: true }).waitFor();
	await page.getByRole('button', { name: 'Semua', exact: true }).click();
	await page.evaluate(() => {
		window.__adminNavigationMarker = 'hydrated';
	});
	assert.equal(
		await page.getByText('Baris A (あ)', { exact: true }).count(),
		0,
		'Course list must not contain lesson details'
	);
	assert(
		!backendRequests.some((path) => path.includes('/catalog')),
		'Course list must not download the entire catalog'
	);
	await mkdir(screenshotDir, { recursive: true });
	await page.screenshot({ path: join(screenshotDir, 'courses.png'), fullPage: true });
	await page.getByRole('button', { name: 'Lihat Materi', exact: true }).focus();
	await page.keyboard.press('Enter');
	await page.waitForURL(`**/admin/courses/${course.id}`);
	await page.getByText('Baris A (あ)', { exact: true }).waitFor();
	assert.equal(await page.title(), `${course.title} | Admin - Nihongo no Hikari`);
	assert.equal(
		await page.evaluate(() => window.__adminNavigationMarker),
		'hydrated',
		'Navigation should stay within the app'
	);
	await page.screenshot({ path: join(screenshotDir, 'course-detail.png'), fullPage: true });
	await testCourseReorder({
		page,
		context,
		course,
		modules,
		lessons,
		mutations,
		origin,
		screenshotDir,
		failNext: () => {
			failNextMutation = true;
		},
		holdMutation: () => {
			let release;
			mutationGate = new Promise((resolve) => {
				release = resolve;
			});
			return () => {
				mutationGate = null;
				release();
			};
		}
	});
	await page.getByRole('button', { name: 'Edit Kursus', exact: true }).click();
	await page.getByRole('heading', { name: 'Edit Kursus', exact: true }).waitFor();
	assert.equal(await page.title(), 'Edit Kursus | Admin - Nihongo no Hikari');
	assert.equal(await page.getByLabel('Judul', { exact: true }).inputValue(), course.title);
	await clickAdminNavigation('Question Sets');
	await page.getByRole('heading', { name: 'Question Sets', exact: true }).waitFor();
	assert.equal(await page.title(), 'Question Sets | Admin - Nihongo no Hikari');
	await page.getByRole('button', { name: /Membaca Hiragana/ }).click();
	await page.getByRole('heading', { name: 'Edit Question Set' }).waitFor();
	assert.equal(await page.getByLabel('Judul set').inputValue(), set.title);
	await page.goto(`${origin}/admin/content/course/new`, { waitUntil: 'networkidle' });
	await page.getByLabel('Judul', { exact: true }).fill('Kursus baru');
	await page.waitForFunction(
		() => JSON.parse(document.querySelector('input[name="payload"]').value).title === 'Kursus baru',
		undefined,
		{ timeout: 10000 }
	);
	const payload = JSON.parse(await page.locator('input[name="payload"]').inputValue());
	assert.equal(payload.title, 'Kursus baru');
	assert(!('module_id' in payload), 'Course payload must omit unrelated UUID fields');
	await clickAdminNavigation('Kursus & Materi');
	await page.getByRole('button', { name: 'Lihat Materi', exact: true }).click();
	await page.getByRole('button', { name: 'Tambah Module', exact: true }).click();
	await page.getByRole('heading', { name: 'Buat Module' }).waitFor();
	assert.equal(
		await page.getByLabel('Judul', { exact: true }).inputValue(),
		'',
		'New resource form must reset its state'
	);
	assert.equal(
		await page
			.locator('form[action="?/save"]')
			.getByRole('button', { name: /^Kursus/ })
			.innerText(),
		course.title
	);
	assert.equal(
		JSON.parse(await page.locator('input[name="payload"]').inputValue()).course_id,
		course.id
	);
	await page.goto(`${origin}/admin/content/course/${course.id}`, { waitUntil: 'networkidle' });
	await page.getByLabel('Judul', { exact: true }).fill('N5 Draft Fixture');
	await page.getByRole('button', { name: 'Simpan Draft', exact: true }).click();
	await page.getByRole('status').filter({ hasText: 'Draft berhasil disimpan.' }).waitFor();
	await page.waitForLoadState('networkidle');
	assert.equal(drafts.get(course.id).title, 'N5 Draft Fixture');
	await page.getByRole('button', { name: 'Terbitkan Perubahan', exact: true }).click();
	await page.getByRole('status').filter({ hasText: 'Konten berhasil diterbitkan.' }).waitFor();
	await page.waitForLoadState('networkidle');
	assert.equal(course.title, 'N5 Draft Fixture');
	await page.getByRole('button', { name: 'Hapus', exact: true }).click();
	await page.getByRole('button', { name: 'Ya, hapus atau arsipkan', exact: true }).click();
	await page.waitForURL('**/admin/courses');
	assert(course.archived_at, 'Content with history must be archived');
	await page.goto(`${origin}/admin/content/course/${course.id}`, { waitUntil: 'networkidle' });
	await page.getByRole('button', { name: 'Pulihkan', exact: true }).click();
	await page.getByRole('status').filter({ hasText: 'Arsip dipulihkan sebagai draft.' }).waitFor();
	await page.waitForLoadState('networkidle');
	assert.equal(course.archived_at, null);
	await page.goto(`${origin}/admin/users`, { waitUntil: 'networkidle' });
	await page.getByRole('button', { name: 'Jadikan Admin', exact: true }).click();
	await page
		.getByRole('status')
		.filter({ hasText: 'Role pengguna berhasil diperbarui.' })
		.waitFor();
	await page.waitForLoadState('networkidle');
	assert.equal(managedUser.role, 'Admin');
	assert.equal(await page.title(), 'Kelola Pengguna | Admin - Nihongo no Hikari');
	// One module prerequisite: hidden for entry content, search, replace, reload, publish and clear.
	await page.goto(`${origin}/admin/content/module/${modules[0].id}`, { waitUntil: 'networkidle' });
	assert.equal(await page.title(), 'Edit Module | Admin - Nihongo no Hikari');
	const modulePicker = page.getByRole('combobox', { name: 'Prasyarat module', exact: true });
	assert.equal(await modulePicker.count(), 0, 'Entry module hides its prerequisite picker');
	await page.getByRole('checkbox', { name: 'Module awal (is_entry)', exact: true }).uncheck();
	await modulePicker.click();
	assert.equal(
		await page.getByRole('option', { name: /Hiragana/ }).count(),
		0,
		'Cannot select self'
	);
	await page.getByPlaceholder('Cari prasyarat...').fill('Tidak ada');
	await page.getByText('Prasyarat tidak ditemukan.', { exact: true }).waitFor();
	await page.getByPlaceholder('Cari prasyarat...').fill('Katakana');
	await page.getByRole('option', { name: /Katakana/ }).waitFor();
	await page.getByPlaceholder('Cari prasyarat...').press('ArrowDown');
	await page.getByPlaceholder('Cari prasyarat...').press('Enter');
	await modulePicker.filter({ hasText: 'Katakana' }).waitFor();
	assert.deepEqual(
		JSON.parse(await page.locator('input[name="payload"]').inputValue()).module_prerequisites,
		[modules[1].id]
	);
	await modulePicker.click();
	await page.getByPlaceholder('Cari prasyarat...').fill('Kanji');
	await page.getByRole('option', { name: /Kanji/ }).click();
	await modulePicker.filter({ hasText: 'Kanji' }).waitFor();
	assert.deepEqual(
		JSON.parse(await page.locator('input[name="payload"]').inputValue()).module_prerequisites,
		[modules[2].id],
		'A new selection replaces the previous prerequisite'
	);
	await modulePicker.click();
	await page.screenshot({ path: join(screenshotDir, 'module-prerequisites.png'), fullPage: true });
	await page.getByPlaceholder('Cari prasyarat...').press('Escape');
	await page.getByRole('button', { name: 'Simpan Draft', exact: true }).click();
	await page.getByRole('status').filter({ hasText: 'Draft berhasil disimpan.' }).waitFor();
	await page.waitForLoadState('networkidle');
	assert.deepEqual(drafts.get(modules[0].id).module_prerequisites, [modules[2].id]);
	assert.deepEqual(modules[0].module_prerequisites, [], 'Draft must not change live prerequisites');
	await page.reload({ waitUntil: 'networkidle' });
	await modulePicker.filter({ hasText: 'Kanji' }).waitFor();
	assert.equal(await page.getByRole('checkbox', { name: /Module awal/ }).isChecked(), false);
	await page.getByRole('button', { name: 'Terbitkan Perubahan', exact: true }).click();
	await page.getByRole('status').filter({ hasText: 'Konten berhasil diterbitkan.' }).waitFor();
	await page.waitForLoadState('networkidle');
	assert.deepEqual(modules[0].module_prerequisites, [modules[2].id]);
	assert.equal(modules[0].is_entry, false);
	await modulePicker.click();
	await page.getByRole('option', { name: 'Tanpa prasyarat', exact: true }).click();
	await page.getByRole('button', { name: 'Simpan Draft', exact: true }).click();
	await page.getByRole('status').filter({ hasText: 'Draft berhasil disimpan.' }).waitFor();
	await page.waitForLoadState('networkidle');
	await page.getByRole('button', { name: 'Terbitkan Perubahan', exact: true }).click();
	await page.getByRole('status').filter({ hasText: 'Konten berhasil diterbitkan.' }).waitFor();
	await page.waitForLoadState('networkidle');
	assert.deepEqual(modules[0].module_prerequisites, []);
	await modulePicker.click();
	await page.getByRole('option', { name: /Katakana/ }).click();
	await page.getByRole('checkbox', { name: 'Module awal (is_entry)', exact: true }).check();
	assert.equal(await modulePicker.count(), 0);
	assert.deepEqual(
		JSON.parse(await page.locator('input[name="payload"]').inputValue()).module_prerequisites,
		[]
	);
	await page.getByRole('button', { name: 'Simpan Draft', exact: true }).click();
	await page.getByRole('status').filter({ hasText: 'Draft berhasil disimpan.' }).waitFor();
	await page.waitForLoadState('networkidle');
	await page.getByRole('button', { name: 'Terbitkan Perubahan', exact: true }).click();
	await page.getByRole('status').filter({ hasText: 'Konten berhasil diterbitkan.' }).waitFor();
	await page.waitForLoadState('networkidle');
	assert.equal(modules[0].is_entry, true);
	assert.deepEqual(modules[0].module_prerequisites, []);
	// Existing lesson prerequisite is cleared when entry content is saved and published.
	await page.goto(`${origin}/admin/content/lesson/${lessons[1].id}`, { waitUntil: 'networkidle' });
	assert.equal(await page.title(), 'Edit Lesson | Admin - Nihongo no Hikari');
	await page.getByRole('textbox', { name: 'Kode HTML', exact: true }).waitFor();
	assert.equal(
		await lessonHTMLValue(page),
		lessons[1].content.content,
		'Opening the editor preserves untouched source line endings'
	);
	const lessonPicker = page.getByRole('combobox', { name: 'Prasyarat lesson', exact: true });
	await lessonPicker.filter({ hasText: 'Baris A' }).waitFor();
	await lessonPicker.click();
	assert.equal(await page.getByRole('option', { name: /Baris KA/ }).count(), 0);
	await page.getByRole('option', { name: /Baris A/ }).click();
	await page.getByRole('checkbox', { name: 'Lesson awal (is_entry)', exact: true }).check();
	assert.equal(await lessonPicker.count(), 0);
	await page.getByRole('button', { name: 'Simpan Draft', exact: true }).click();
	await page.getByRole('status').filter({ hasText: 'Draft berhasil disimpan.' }).waitFor();
	await page.waitForLoadState('networkidle');
	assert.deepEqual(drafts.get(lessons[1].id).lesson_prerequisites, []);
	await page.reload({ waitUntil: 'networkidle' });
	assert.equal(await lessonPicker.count(), 0);
	assert.equal(await page.getByRole('checkbox', { name: /Lesson awal/ }).isChecked(), true);
	await page.getByRole('button', { name: 'Terbitkan Perubahan', exact: true }).click();
	await page.getByRole('status').filter({ hasText: 'Konten berhasil diterbitkan.' }).waitFor();
	await page.waitForLoadState('networkidle');
	assert.deepEqual(lessons[1].lesson_prerequisites, []);
	assert.equal(lessons[1].is_entry, true);
	await page.goto(`${origin}/admin/content/lesson/${lessons[0].id}`, { waitUntil: 'networkidle' });
	assert.equal(await page.getByRole('button', { name: 'Visual', exact: true }).count(), 0);
	await testLessonEditor(page);
	const lessonHTML = await readFile(
		new URL('./fixtures/lesson-vocabulary.html', import.meta.url),
		'utf8'
	);
	await page.getByLabel('Kode HTML', { exact: true }).fill(lessonHTML);
	await waitForLessonHTML(page, lessonHTML);
	await page.locator('.cm-editor').screenshot({ path: join(screenshotDir, 'lesson-html.png') });
	await page
		.locator('[data-slot="tabs"]')
		.screenshot({ path: join(screenshotDir, 'lesson-tabs.png') });
	await page.getByLabel('Tips tambahan', { exact: true }).fill('Latih kosakata あか setiap hari.');
	await page.getByRole('tab', { name: 'Preview', exact: true }).click();
	await page
		.frameLocator('iframe[title="Preview konten lesson"]')
		.getByText('3. Contoh Kosakata', { exact: true })
		.waitFor();
	assert(mutations.some((request) => request.path.endsWith('/lesson-content/preview')));
	await page.getByRole('tab', { name: 'HTML', exact: true }).click();
	assert.equal(await lessonHTMLValue(page), lessonHTML);
	failNextMutation = true;
	await submitContentWithLoading('save');
	await page
		.getByRole('status')
		.filter({ hasText: 'Fixture: operasi gagal. Silakan coba lagi.' })
		.waitFor();
	assert.equal(await lessonHTMLValue(page), lessonHTML, 'Failed save preserves HTML');
	await submitContentWithLoading('save');
	await page.getByRole('status').filter({ hasText: 'Draft berhasil disimpan.' }).waitFor();
	await page.waitForLoadState('networkidle');
	assert.equal(drafts.get(lessons[0].id).content.content, lessonHTML);
	assert.equal(drafts.get(lessons[0].id).content.tips, 'Latih kosakata あか setiap hari.');
	await page.reload({ waitUntil: 'networkidle' });
	await page.getByRole('textbox', { name: 'Kode HTML', exact: true }).waitFor();
	assert.equal(await lessonHTMLValue(page), lessonHTML);
	failNextMutation = true;
	await submitContentWithLoading('publish');
	await page
		.getByRole('status')
		.filter({ hasText: 'Fixture: operasi gagal. Silakan coba lagi.' })
		.waitFor();
	assert(drafts.has(lessons[0].id), 'Failed publication keeps the saved draft');
	await submitContentWithLoading('publish');
	await page.getByRole('status').filter({ hasText: 'Konten berhasil diterbitkan.' }).waitFor();
	await page.waitForLoadState('networkidle');
	assert.equal(lessons[0].content.content, lessonHTML);
	await page.goto(`${origin}/admin`, { waitUntil: 'networkidle' });
	await page.getByRole('heading', { name: 'Ringkasan Admin', exact: true }).waitFor();
	assert.equal(await page.title(), 'Ringkasan Admin - Nihongo no Hikari');
	await page.getByRole('button', { name: /^1 Kursus$/ }).click();
	await page.waitForURL('**/admin/courses');
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto(`${origin}/admin/courses`, { waitUntil: 'networkidle' });
	await page.getByRole('button', { name: 'Lihat Materi', exact: true }).waitFor();
	assert(
		await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
		'Mobile layout must not overflow horizontally'
	);
	assert.equal(
		await page.locator('.admin-shell').evaluate((element) => getComputedStyle(element).paddingLeft),
		'16px'
	);
	assert.equal(
		await page
			.locator('.admin-page')
			.first()
			.evaluate((element) => getComputedStyle(element.firstElementChild).marginBottom),
		'24px'
	);
	await page.screenshot({ path: join(screenshotDir, 'courses-mobile.png'), fullPage: true });
	await page.goto(`${origin}/admin/content/lesson/${lessons[1].id}`, { waitUntil: 'networkidle' });
	const mobileEditor = page.getByRole('textbox', { name: 'Kode HTML', exact: true });
	await mobileEditor.fill(`<p style="color: red">${'あいうえお'.repeat(100)}</p>`);
	assert(
		await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
		'HTML editor must wrap long lines within the mobile viewport'
	);
	await mobileEditor.screenshot({ path: join(screenshotDir, 'lesson-html-mobile.png') });
	await page
		.locator('[data-slot="tabs"]')
		.screenshot({ path: join(screenshotDir, 'lesson-tabs-mobile.png') });
	assert.equal(await lessonPicker.count(), 0, 'Entry lesson hides picker on mobile too');
	await page.getByRole('checkbox', { name: 'Lesson awal (is_entry)', exact: true }).uncheck();
	await page.getByRole('combobox', { name: 'Prasyarat lesson', exact: true }).click();
	await page.getByRole('option', { name: /Baris A/ }).waitFor();
	assert(
		await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
		'Prerequisite combobox must fit the mobile viewport'
	);
	await page.screenshot({
		path: join(screenshotDir, 'lesson-prerequisites-mobile.png'),
		fullPage: true
	});
	assert.deepEqual(errors, [], 'Admin navigation must not produce browser errors');
	assert.deepEqual(
		transportViolations,
		[],
		'Admin transport must use the proxy and server credentials'
	);
	console.log(
		`PASS: course list/detail, keyboard and SPA navigation, course/question set editors, proxy serialization, form reset, draft/publish/archive/restore, user roles, HTML highlighting/autocomplete/indentation/undo, lesson preview, single prerequisite search/replace/clear/reload/publish, entry visibility, page titles, dashboard, mobile spacing. Screenshots: ${screenshotDir}`
	);
} catch (error) {
	console.error('Browser errors:', errors);
	await mkdir(screenshotDir, { recursive: true });
	await page
		?.screenshot({ path: join(screenshotDir, 'failure.png'), fullPage: true })
		.catch(() => {});
	console.error(serverLog.slice(-4000));
	throw error;
} finally {
	await browser?.close();
	vite.kill();
	api.closeAllConnections();
	await new Promise((resolve) => api.close(resolve));
}
