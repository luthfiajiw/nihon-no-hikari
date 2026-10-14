// Browser regression test with an isolated API fixture; never connects to the real database.
import assert from 'node:assert/strict';
import { createCipheriv, createHash, randomBytes } from 'node:crypto';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';

const course = {
	id: '11111111-1111-4111-8111-111111111111',
	level_id: '55555555-5555-4555-8555-555555555555',
	title: 'Bahasa Jepang Dasar N5',
	slug: 'n5-dasar',
	description: 'Bangun fondasi bahasa Jepang melalui huruf, kosakata, dan tata bahasa.',
	is_published: true,
	module_count: 2,
	lesson_count: 2
};
const modules = [
	{
		id: '22222222-2222-4222-8222-222222222222',
		course_id: course.id,
		title: 'Hiragana',
		slug: 'hiragana',
		is_published: true,
		order_index: 0
	},
	{
		id: '66666666-6666-4666-8666-666666666666',
		course_id: course.id,
		title: 'Katakana',
		slug: 'katakana',
		is_published: false,
		order_index: 1
	}
];
const lessons = ['Baris A (あ)', 'Baris KA (か)'].map((title, index) => ({
	id: `33333333-3333-4333-8333-33333333333${index}`,
	module_id: modules[0].id,
	title,
	slug: `baris-${index}`,
	is_published: true,
	order_index: index,
	content: { content: '<p>Belajar hiragana.</p>', tips: '' }
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
const managedUser = {
	id: '77777777-7777-4777-8777-777777777777',
	email: 'student@example.test',
	display_name: 'Siswa Fixture',
	role: 'User'
};
let courseDraft = null;
const api = createServer(async (request, response) => {
	const url = new URL(request.url, `http://127.0.0.1:${apiPort}`);
	backendRequests.push(url.pathname + url.search);
	await new Promise((resolve) => setTimeout(resolve, 150));
	if (request.method !== 'GET') {
		let body = '';
		for await (const chunk of request) body += chunk;
		const payload = body ? JSON.parse(body) : null;
		mutations.push({ path: url.pathname, method: request.method, payload });
		let result = { success: true };
		if (url.pathname.endsWith('/lesson-content/preview')) result.data = payload.content;
		else if (url.pathname.endsWith('/role')) managedUser.role = payload.role;
		else if (url.pathname.endsWith('/publish')) {
			Object.assign(course, courseDraft ?? {}, { is_published: true });
			courseDraft = null;
			result.id = course.id;
		} else if (url.pathname.endsWith('/restore')) {
			course.archived_at = null;
			course.is_published = false;
		} else if (request.method === 'DELETE') course.archived_at = new Date().toISOString();
		else if (request.method === 'PATCH') courseDraft = payload;
		else if (request.method === 'POST') result.id = course.id;
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
			modules,
			lessons: lessons.map((lesson) => {
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
		JSON.stringify({ success: Boolean(data), data, draft: data === course ? courseDraft : null })
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
});
vite.stderr.on('data', (chunk) => {
	serverLog = (serverLog + chunk).slice(-12000);
});
let browser;
let page;
const errors = [];
try {
	let ready = false;
	for (let attempt = 0; attempt < 120; attempt++) {
		if (vite.exitCode !== null) throw new Error(`Vite exited: ${serverLog}`);
		try {
			await fetch(`${origin}/signin`);
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
	await page.goto(`${origin}/admin/courses`, { waitUntil: 'networkidle', timeout: 120000 });
	await page.getByRole('button', { name: 'Lihat Materi', exact: true }).waitFor();
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
	assert.equal(
		await page.evaluate(() => window.__adminNavigationMarker),
		'hydrated',
		'Navigation should stay within the app'
	);
	await page.screenshot({ path: join(screenshotDir, 'course-detail.png'), fullPage: true });
	await page.getByRole('button', { name: 'Edit Kursus', exact: true }).click();
	await page.getByRole('heading', { name: 'Edit Kursus', exact: true }).waitFor();
	assert.equal(await page.getByLabel('Judul', { exact: true }).inputValue(), course.title);
	await page.getByRole('button', { name: 'Question Sets', exact: true }).click();
	await page.getByRole('heading', { name: 'Question Sets', exact: true }).waitFor();
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
	await page.getByRole('button', { name: 'Kursus & Materi', exact: true }).click();
	await page.getByRole('button', { name: 'Lihat Materi', exact: true }).click();
	await page.getByRole('button', { name: 'Tambah Module', exact: true }).click();
	await page.getByRole('heading', { name: 'Buat Module' }).waitFor();
	assert.equal(
		await page.getByLabel('Judul', { exact: true }).inputValue(),
		'',
		'New resource form must reset its state'
	);
	assert.equal(await page.getByRole('combobox', { name: /^Kursus/ }).inputValue(), course.id);
	await page.goto(`${origin}/admin/content/course/${course.id}`, { waitUntil: 'networkidle' });
	await page.getByLabel('Judul', { exact: true }).fill('N5 Draft Fixture');
	await page.getByRole('button', { name: 'Simpan Draft', exact: true }).click();
	await page.getByRole('status').filter({ hasText: 'Draft berhasil disimpan.' }).waitFor();
	assert.equal(courseDraft.title, 'N5 Draft Fixture');
	await page.getByRole('button', { name: 'Terbitkan Perubahan', exact: true }).click();
	await page.getByRole('status').filter({ hasText: 'Konten berhasil diterbitkan.' }).waitFor();
	assert.equal(course.title, 'N5 Draft Fixture');
	await page.getByRole('button', { name: 'Hapus', exact: true }).click();
	await page.getByRole('button', { name: 'Ya, hapus atau arsipkan', exact: true }).click();
	await page.waitForURL('**/admin/courses');
	assert(course.archived_at, 'Content with history must be archived');
	await page.goto(`${origin}/admin/content/course/${course.id}`, { waitUntil: 'networkidle' });
	await page.getByRole('button', { name: 'Pulihkan', exact: true }).click();
	await page.getByRole('status').filter({ hasText: 'Arsip dipulihkan sebagai draft.' }).waitFor();
	assert.equal(course.archived_at, null);
	await page.goto(`${origin}/admin/users`, { waitUntil: 'networkidle' });
	await page.getByRole('button', { name: 'Jadikan Admin', exact: true }).click();
	await page
		.getByRole('status')
		.filter({ hasText: 'Role pengguna berhasil diperbarui.' })
		.waitFor();
	assert.equal(managedUser.role, 'Admin');
	await page.goto(`${origin}/admin/content/lesson/${lessons[0].id}`, { waitUntil: 'networkidle' });
	await page.getByRole('button', { name: 'Preview', exact: true }).click();
	await page
		.frameLocator('iframe[title="Preview konten lesson"]')
		.getByText('Belajar hiragana.', { exact: true })
		.waitFor();
	assert(mutations.some((request) => request.path.endsWith('/lesson-content/preview')));
	await page.goto(`${origin}/admin`, { waitUntil: 'networkidle' });
	await page.getByRole('heading', { name: 'Ringkasan Admin', exact: true }).waitFor();
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
	assert.deepEqual(errors, [], 'Admin navigation must not produce browser errors');
	console.log(
		`PASS: course list/detail, keyboard and SPA navigation, course/question set editors, proxy serialization, form reset, draft/publish/archive/restore, user roles, lesson preview, dashboard, mobile spacing. Screenshots: ${screenshotDir}`
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
