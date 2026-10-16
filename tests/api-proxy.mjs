// Exercises the real SvelteKit hooks/SSR/browser boundary against an isolated API.
import assert from 'node:assert/strict';
import { createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const port = Number(process.env.API_PROXY_PORT ?? 4183);
const origin = `http://127.0.0.1:${port}`;
const apiOrigin = `http://127.0.0.1:${port + 1}`;
const secret = randomBytes(32).toString('hex');
const course = {
	id: '11111111-1111-4111-8111-111111111111',
	slug: 'fixture-course',
	title: 'Proxy Fixture Course',
	description: 'Belajar melalui proxy',
	total_minutes: 60,
	total_lessons: 1,
	level: { id: 'level', code: 'N5', name: 'Pemula' }
};
const module = {
	id: '22222222-2222-4222-8222-222222222222',
	slug: 'fixture-module',
	title: 'Fixture Module',
	description: 'Modul fixture',
	is_mandatory: true,
	is_entry: true,
	status: 'unlocked',
	estimated_minutes: 60
};
const questionSet = {
	id: '44444444-4444-4444-8444-444444444444',
	title: 'Fixture Reading',
	kind: 'practice',
	skill: 'reading',
	passing_score: 80,
	question_count: 1,
	cooldown_minutes: 0,
	shuffle_questions: false,
	is_passed: false,
	attempts_used: 0
};
const lesson = {
	id: '33333333-3333-4333-8333-333333333333',
	slug: 'fixture-lesson',
	title: 'Fixture Lesson',
	status: 'unlocked',
	content: '<p>Konten fixture melalui proxy.</p>',
	question_sets: [questionSet]
};
const question = {
	id: '55555555-5555-4555-8555-555555555555',
	question_type: 'multiple_choice',
	skill: 'reading',
	prompt_text: 'Pilih jawaban fixture',
	stimulus_text: '',
	points: 10,
	order_index: 0,
	options: [
		{ id: '66666666-6666-4666-8666-666666666666', label: 'Jawaban fixture', order_index: 0 }
	]
};
let token = 'initial';
let rotation = 0;
let rejectNextMutation = false;
let invalidRefresh = false;
let attempts = 0;
const requests = [];
const violations = [];
const api = createServer(async (request, response) => {
	const url = new URL(request.url, apiOrigin);
	let body = '';
	for await (const chunk of request) body += chunk;
	requests.push({
		path: url.pathname,
		query: url.search,
		method: request.method,
		body,
		bearer: request.headers.authorization
	});
	const send = (status, payload) => {
		response.writeHead(status, { 'Content-Type': 'application/json' });
		response.end(payload === undefined ? undefined : JSON.stringify(payload));
	};
	const ok = (data, status = 200) => send(status, { success: true, message: 'Berhasil.', data });
	if (request.headers.cookie) violations.push('App cookie reached upstream');
	if (url.pathname.startsWith('/api/v1/auth/')) {
		if (request.headers.authorization) violations.push('Bearer attached to public auth');
		if (url.pathname.endsWith('/signin')) {
			token = 'initial';
			return ok({
				id: 'fixture-user',
				email: 'user@example.test',
				display_name: 'Fixture User',
				role: 'User',
				session: {
					id: 'fixture-session',
					access_token: token,
					access_token_expires_at: '2000-01-01T00:00:00Z',
					refresh_token: 'refresh-initial',
					refresh_token_expires_at: '2099-01-01T00:00:00Z'
				}
			});
		}
		if (url.pathname.endsWith('/token')) {
			if (invalidRefresh) return send(401, { error: 'Refresh invalid' });
			token = `rotated-${++rotation}`;
			return ok({
				access_token: token,
				access_token_expires_at: '2099-01-01T00:00:00Z',
				refresh_token: `refresh-${token}`,
				refresh_token_expires_at: '2099-02-01T00:00:00Z'
			});
		}
		if (url.pathname.endsWith('/signout')) return ok();
	}
	if (request.headers.authorization !== `Bearer ${token}`) {
		violations.push(`Incorrect bearer for ${url.pathname}`);
		return send(401, { error: 'Unauthorized' });
	}
	if (rejectNextMutation && request.method === 'PUT') {
		rejectNextMutation = false;
		return send(401, { error: 'Force refresh and retry' });
	}
	if (url.pathname === '/api/v1/courses') return ok([course]);
	if (url.pathname === `/api/v1/courses/${course.id}`) return ok({ ...course, modules: [module] });
	if (url.pathname === '/api/v1/lessons') return ok([{ module, lessons: [lesson] }]);
	if (url.pathname === `/api/v1/modules/${module.id}/question-sets`) return ok([]);
	if (url.pathname === `/api/v1/lessons/${lesson.id}`) return ok(lesson);
	if (request.method === 'PUT' && url.pathname.endsWith('/progress')) {
		const progress = JSON.parse(body);
		if (url.pathname.includes('/modules/')) module.status = progress.status;
		else lesson.status = progress.status;
		return ok();
	}
	if (url.pathname === `/api/v1/question-sets/${questionSet.id}/attempts`)
		return ok(
			{
				id: `attempt-${++attempts}`,
				number: attempts,
				status: 'in_progress',
				startedAt: new Date().toISOString(),
				question_set: questionSet,
				questions: [question]
			},
			201
		);
	if (url.pathname.endsWith('/submit')) {
		questionSet.is_passed = true;
		lesson.status = 'completed';
		return ok({
			attempt_id: 'attempt-1',
			score: 100,
			earned_points: 10,
			total_points: 10,
			passing_score: 80,
			is_passed: true,
			lesson_status: 'completed',
			submitted_at: new Date().toISOString(),
			skills: [],
			answers: [
				{
					question_id: question.id,
					skill: 'reading',
					is_correct: true,
					earned_points: 10,
					max_points: 10,
					explanation: null
				}
			]
		});
	}
	if (url.pathname.endsWith('/abandon')) return send(204);
	return send(404, { error: 'Fixture endpoint missing' });
});

await new Promise((resolve, reject) => {
	api.once('error', reject);
	api.listen(port + 1, '127.0.0.1', resolve);
});
const vite = spawn(
	process.execPath,
	[
		'node_modules/vite/bin/vite.js',
		...(process.env.API_PROXY_PREVIEW ? ['preview'] : []),
		'--host',
		'127.0.0.1',
		'--port',
		String(port),
		'--strictPort'
	],
	{
		cwd: process.cwd(),
		windowsHide: true,
		stdio: ['ignore', 'pipe', 'pipe'],
		env: { ...process.env, AUTH_SECRET: secret, API_BASE_URL: `${apiOrigin}/api` }
	}
);
let log = '';
for (const stream of [vite.stdout, vite.stderr])
	stream.on('data', (chunk) => {
		log = (log + chunk).slice(-16000);
	});
let browser;
let page;
const errors = [];
try {
	let ready = false;
	const deadline = Date.now() + 120000;
	while (Date.now() < deadline) {
		if (vite.exitCode !== null) throw new Error(`Vite exited: ${log}`);
		try {
			const response = await fetch(`${origin}/signin`, { signal: AbortSignal.timeout(5000) });
			if (response.ok) {
				ready = true;
				break;
			}
		} catch {
			/* Retry while Vite starts. */
		}
		await new Promise((resolve) => setTimeout(resolve, 500));
	}
	assert(ready, 'Vite must start');
	browser = await chromium.launch({
		headless: true,
		...(process.env.API_PROXY_CHANNEL ? { channel: process.env.API_PROXY_CHANNEL } : {})
	});
	const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
	await context.route('https://github.com/**', (route) => route.abort());
	page = await context.newPage();
	page.setDefaultTimeout(60000);
	page.on('pageerror', (error) => errors.push(error.message));
	const browserApiRequests = [];
	page.on('request', (request) => {
		const url = new URL(request.url());
		if (url.origin === apiOrigin || url.pathname.includes('/_app/remote'))
			violations.push(`Browser bypassed proxy: ${url}`);
		if (url.origin === origin && url.pathname.startsWith('/api/')) {
			browserApiRequests.push(url.pathname);
			if (request.headers().authorization) violations.push('Browser supplied bearer');
		}
	});
	const state = async () => {
		const cookie = (await context.cookies()).find((item) => item.name === 'nnh.auth');
		if (!cookie) return null;
		assert(cookie.httpOnly, 'Auth cookie must stay HttpOnly');
		const raw = Buffer.from(cookie.value, 'base64url');
		const decipher = createDecipheriv(
			'aes-256-gcm',
			createHash('sha256').update(secret).digest(),
			raw.subarray(0, 12)
		);
		decipher.setAuthTag(raw.subarray(12, 28));
		return JSON.parse(
			Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString()
		);
	};
	const signin = async () => {
		await page.goto(`${origin}/signin`, { waitUntil: 'networkidle', timeout: 120000 });
		await page.getByLabel('Email', { exact: true }).fill('user@example.test');
		await page.getByLabel('Password', { exact: true }).fill('password123');
		await page.getByRole('button', { name: 'Login', exact: true }).click();
		await page.waitForURL((url) => url.pathname !== '/signin');
	};
	await signin();
	await page.goto(`${origin}/courses`, { waitUntil: 'networkidle' });
	await page.getByRole('heading', { name: course.title, exact: true }).waitFor();
	assert.equal(
		(await state()).session.accessToken,
		'rotated-1',
		'Nested SSR refresh must reach the browser cookie'
	);
	assert.equal(requests.filter((r) => r.path.endsWith('/auth/token')).length, 1);
	await page.getByRole('button', { name: 'Lihat Detail', exact: true }).click();
	await page.getByRole('button', { name: 'Mulai Belajar', exact: true }).waitFor();
	rejectNextMutation = true;
	await page.getByRole('button', { name: 'Mulai Belajar', exact: true }).click();
	await page.getByRole('heading', { name: lesson.title, exact: true }).waitFor();
	assert.equal((await state()).session.accessToken, 'rotated-2');
	const progressRequests = requests.filter(
		(r) => r.path.includes('/modules/') && r.path.endsWith('/progress')
	);
	assert.equal(progressRequests.length, 2, 'One 401 is retried exactly once');
	assert.equal(
		progressRequests[0].body,
		progressRequests[1].body,
		'Retry preserves the mutation body'
	);
	assert.equal(lesson.status, 'in_progress');
	await page.getByRole('button', { name: 'Kerjakan', exact: true }).click();
	await page.getByRole('button', { name: 'Jawaban fixture', exact: true }).click();
	await page.getByRole('button', { name: 'Selesai', exact: true }).click();
	await page.getByRole('button', { name: 'Ya, kirim jawaban', exact: true }).click();
	await page.getByRole('heading', { name: 'Nilai 100', exact: true }).waitFor();
	const submission = requests.find((r) => r.path.endsWith('/submit'));
	assert.deepEqual(JSON.parse(submission.body), {
		answers: [
			{ question_id: question.id, selected_option_id: question.options[0].id, stroke_input: null }
		]
	});
	await page.getByRole('button', { name: 'Kembali ke materi', exact: true }).last().click();
	await page.getByRole('button', { name: 'Lihat soal', exact: true }).click();
	await page.getByRole('button', { name: 'Jawaban fixture', exact: true }).waitFor();
	// A document navigation exercises the keepalive abandon request.
	const abandon = page.waitForResponse((response) => response.url().endsWith('/abandon'));
	await page.goto(`${origin}/courses`, { waitUntil: 'networkidle' });
	assert.equal((await abandon).status(), 204);
	assert.equal(requests.filter((r) => r.path.endsWith('/abandon')).length, 1);
	await page.locator('[aria-haspopup="menu"]').filter({ hasText: 'Fixture User' }).click();
	await page.getByRole('menuitem', { name: 'Keluar', exact: true }).click();
	await page.waitForURL('**/signin');
	assert.equal(await state(), null);
	assert.deepEqual(JSON.parse(requests.find((r) => r.path.endsWith('/auth/signout')).body), {
		session_id: 'fixture-session'
	});
	await signin();
	invalidRefresh = true;
	// Exercise the browser's Secure localhost cookie behavior, rather than the
	// Node APIRequestContext cookie jar, which omits Secure cookies over HTTP.
	const invalidStatus = await page.evaluate(async () => (await fetch('/api/v1/courses')).status);
	assert.equal(invalidStatus, 401);
	assert.equal(requests.filter((request) => request.path.endsWith('/auth/token')).length, 3);
	assert.equal(await state(), null, 'Invalid refresh clears the browser session');
	await page.goto(`${origin}/courses`, { waitUntil: 'networkidle' });
	assert.equal(new URL(page.url()).pathname, '/signin');
	assert(browserApiRequests.includes(`/api/v1/lessons/${lesson.id}`), 'Lesson reads use the proxy');
	assert(
		browserApiRequests.includes(`/api/v1/question-sets/${questionSet.id}/attempts`),
		'Start attempt uses the proxy'
	);
	assert.deepEqual(errors, [], 'Browser must not throw');
	assert.deepEqual(violations, [], 'Credentials must stay within the server boundary');
	console.log(
		'PASS: signin/signout, SSR cookie rotation, course/lesson reads, progress retry/body, start/submit/keepalive abandon, invalid refresh, browser/proxy credential boundary.'
	);
} catch (error) {
	console.error('Browser errors:', errors, 'Boundary violations:', violations);
	console.error(log.slice(-6000));
	if (page)
		console.error(
			'Current page:',
			page.url(),
			(await page.locator('body').innerText()).slice(-3500)
		);
	throw error;
} finally {
	await browser?.close();
	vite.kill();
	api.closeAllConnections();
	await new Promise((resolve) => api.close(resolve));
}
