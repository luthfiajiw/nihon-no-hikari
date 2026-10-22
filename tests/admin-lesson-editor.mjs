import assert from 'node:assert/strict';

export async function lessonHTMLValue(page) {
	return JSON.parse(await page.locator('input[name="payload"]').inputValue()).content.content;
}

export async function waitForLessonHTML(page, content) {
	await page.waitForFunction(
		(expected) =>
			JSON.parse(document.querySelector('input[name="payload"]').value).content.content ===
			expected,
		content,
		{ timeout: 10000 }
	);
}

export async function openLessonEditor(page) {
	await page.getByRole('button', { name: 'Buka editor konten pembelajaran', exact: true }).click();
	await page.getByRole('dialog', { name: 'Editor Konten Pembelajaran', exact: true }).waitFor();
	await page.getByRole('textbox', { name: 'Kode HTML', exact: true }).waitFor();
}

export async function closeLessonEditor(page) {
	await page.getByRole('button', { name: 'Tutup editor konten pembelajaran', exact: true }).click();
	await page.getByRole('dialog').waitFor({ state: 'hidden' });
	await page.waitForFunction(
		() => document.activeElement?.getAttribute('aria-label') === 'Buka editor konten pembelajaran'
	);
}

export async function testLessonEditor(page) {
	assert.equal(await page.getByRole('tablist').count(), 0, 'Page has no editor tabs');
	assert.equal(await page.getByRole('textbox', { name: 'Kode HTML', exact: true }).count(), 0);
	await page
		.frameLocator('iframe[title="Preview konten lesson"]')
		.getByText('Belajar hiragana.')
		.waitFor();
	await openLessonEditor(page);
	const dialog = page.getByRole('dialog', { name: 'Editor Konten Pembelajaran', exact: true });
	const livePreview = page.frameLocator('iframe[title="Preview langsung konten lesson"]');
	await livePreview.getByText('Belajar hiragana.').waitFor();
	const editor = page.getByRole('textbox', { name: 'Kode HTML', exact: true });
	await editor.waitFor();
	assert.equal(await editor.getAttribute('contenteditable'), 'true');
	assert.equal(await editor.getAttribute('spellcheck'), 'false');
	assert.equal(await editor.getAttribute('aria-describedby'), 'lesson-html-help');
	assert.equal(
		await dialog.getByRole('tablist').count(),
		0,
		'Desktop shows both panels without tabs'
	);
	const dialogBounds = await dialog.boundingBox();
	const viewport = page.viewportSize();
	assert(Math.abs(dialogBounds.x - 16) < 1 && Math.abs(dialogBounds.y - 16) < 1);
	assert(Math.abs(dialogBounds.width - (viewport.width - 32)) < 1);
	assert(Math.abs(dialogBounds.height - (viewport.height - 32)) < 1);
	const editorBounds = await dialog.locator('.cm-editor').boundingBox();
	const previewBounds = await dialog.locator('iframe').boundingBox();
	assert.equal(await dialog.locator('iframe').getAttribute('sandbox'), '');
	assert(editorBounds.x + editorBounds.width < previewBounds.x, 'Editor sits left of the preview');
	assert(Math.abs(editorBounds.width - previewBounds.width) < 4, 'Both columns have equal width');
	const closeButton = dialog.getByRole('button', { name: 'Tutup editor konten pembelajaran' });
	await closeButton.focus();
	await closeButton.press('Tab');
	assert(
		await dialog.evaluate((element) => element.contains(document.activeElement)),
		'Focus stays in the dialog'
	);
	assert(await page.locator('.cm-lineNumbers').isVisible(), 'Editor shows line numbers');
	const original = await lessonHTMLValue(page);
	const highlighted =
		'<section class="lesson"><!-- Catatan --><p style="color: red">あいう 🎯</p></section>';
	await editor.fill(highlighted);
	await waitForLessonHTML(page, highlighted);
	await page.waitForFunction(() => {
		const tokens = [...document.querySelectorAll('#lesson-html span')];
		return ['section', 'class', '"lesson"', '<!-- Catatan -->'].every((text) =>
			tokens.some((token) => token.textContent === text)
		);
	});
	const colors = await editor
		.locator('span')
		.evaluateAll((tokens) =>
			['section', 'class', '"lesson"', '<!-- Catatan -->'].map(
				(text) => getComputedStyle(tokens.find((token) => token.textContent === text)).color
			)
		);
	assert.equal(
		new Set(colors).size,
		4,
		'Tags, attributes, values and comments have distinct colors'
	);

	await editor.fill('');
	await editor.pressSequentially('<section>');
	await waitForLessonHTML(page, '<section></section>');
	await editor.press('Enter');
	await waitForLessonHTML(page, '<section>\n  \n</section>');
	await editor.press('Tab');
	await waitForLessonHTML(page, '<section>\n    \n</section>');
	await editor.press('Shift+Tab');
	await waitForLessonHTML(page, '<section>\n  \n</section>');
	await editor.press('Escape');
	await editor.press('Tab');
	assert(!(await editor.evaluate((element) => element === document.activeElement)));
	assert(await dialog.isVisible(), 'Escape in CodeMirror does not close the dialog');

	await editor.fill('<sec');
	await editor.press('Control+Space');
	const section = page.getByRole('option', { name: 'section', exact: true });
	await section.waitFor();
	await section.click();
	await waitForLessonHTML(page, '<section');
	await editor.fill('<p cla');
	await editor.press('Control+Space');
	await page.getByRole('option', { name: 'class', exact: true }).click();
	assert((await lessonHTMLValue(page)).startsWith('<p class'), 'Autocomplete suggests attributes');

	await editor.fill('<p>あ</p>');
	await editor.press('Control+End');
	await editor.pressSequentially('!');
	await waitForLessonHTML(page, '<p>あ</p>!');
	await closeLessonEditor(page);
	await openLessonEditor(page);
	await waitForLessonHTML(page, '<p>あ</p>!');
	await editor.focus();
	await editor.press('Control+z');
	assert.notEqual(await lessonHTMLValue(page), '<p>あ</p>!', 'Undo survives closing the dialog');
	await editor.press('Control+y');
	await waitForLessonHTML(page, '<p>あ</p>!');
	await editor.pressSequentially('?');
	await waitForLessonHTML(page, '<p>あ</p>!?');
	await page.setViewportSize({ width: 390, height: 844 });
	const htmlTab = dialog.getByRole('tab', { name: 'HTML', exact: true });
	const previewTab = dialog.getByRole('tab', { name: 'Preview', exact: true });
	await htmlTab.waitFor();
	assert.equal(await htmlTab.getAttribute('aria-selected'), 'true');
	await editor.evaluate((element) => {
		element.dataset.editorInstance = 'preserved';
	});
	await htmlTab.focus();
	await htmlTab.press('ArrowRight');
	assert.equal(await previewTab.getAttribute('aria-selected'), 'true');
	assert(!(await editor.isVisible()), 'Mobile preview tab hides the editor');
	await dialog.locator('iframe').waitFor();
	await previewTab.press('ArrowLeft');
	assert.equal(await htmlTab.getAttribute('aria-selected'), 'true');
	assert.equal(await editor.getAttribute('data-editor-instance'), 'preserved');
	assert(
		await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth),
		'Mobile dialog does not overflow'
	);
	await editor.press('Control+z');
	assert.notEqual(
		await lessonHTMLValue(page),
		'<p>あ</p>!?',
		'Undo survives responsive layout and tab changes'
	);
	await editor.press('Control+y');
	await waitForLessonHTML(page, '<p>あ</p>!?');
	await page.setViewportSize(viewport);
	await page.waitForFunction(() => !document.querySelector('[role="dialog"] [role="tablist"]'));

	// Rapid edits share one debounced preview request for both preview surfaces.
	await editor.fill('<p>Preview sebelum debounce</p>');
	await livePreview.getByText('Preview sebelum debounce', { exact: true }).waitFor();
	let previewRequests = 0;
	const previewEndpoint = '**/api/admin/lesson-preview';
	const countPreview = async (route) => {
		previewRequests++;
		await route.fulfill({ json: { data: route.request().postDataJSON().content } });
	};
	await page.route(previewEndpoint, countPreview);
	await editor.fill('<p>Preview satu</p>');
	await editor.fill('<p>Preview dua</p>');
	await editor.fill('<p>Preview terbaru</p>');
	await livePreview.getByText('Preview terbaru', { exact: true }).waitFor();
	assert.equal(previewRequests, 1, 'Typing is debounced and previews share one request');
	await page.unroute(previewEndpoint, countPreview);

	// Hold an older response until the newer preview has already arrived.
	let releaseOld;
	const oldStarted = page.waitForRequest(
		(request) =>
			request.url().endsWith('/api/admin/lesson-preview') &&
			request.postDataJSON().content.content === '<p>Versi lama</p>'
	);
	const oldGate = new Promise((resolve) => {
		releaseOld = resolve;
	});
	const outOfOrderPreview = async (route) => {
		const content = route.request().postDataJSON().content;
		if (content.content === '<p>Versi lama</p>') {
			await oldGate;
		}
		await route.fulfill({ json: { data: content } });
	};
	await page.route(previewEndpoint, outOfOrderPreview);
	await editor.fill('<p>Versi lama</p>');
	await oldStarted;
	assert(
		await livePreview.getByText('Preview terbaru', { exact: true }).isVisible(),
		'Previous preview remains visible while loading'
	);
	await editor.fill('<p>Versi terbaru</p>');
	await livePreview.getByText('Versi terbaru', { exact: true }).waitFor();
	const oldResponse = page.waitForResponse(
		(response) =>
			response.url().endsWith('/api/admin/lesson-preview') &&
			response.request().postDataJSON().content.content === '<p>Versi lama</p>'
	);
	releaseOld();
	await (await oldResponse).finished();
	await page.evaluate(
		() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
	);
	assert(
		await livePreview.getByText('Versi terbaru', { exact: true }).isVisible(),
		'Stale response cannot replace the latest preview'
	);
	assert(
		(await page.locator('iframe[title="Preview konten lesson"]').getAttribute('srcdoc')).includes(
			'Versi terbaru'
		)
	);
	await page.unroute(previewEndpoint, outOfOrderPreview);

	await page.route(
		'**/api/admin/lesson-preview',
		async (route) => {
			await route.fulfill({
				status: 500,
				contentType: 'application/json',
				body: JSON.stringify({ error: 'Fixture: preview gagal.' })
			});
		},
		{ times: 1 }
	);
	await editor.fill('<p>Preview setelah retry</p>');
	await dialog.getByRole('alert').filter({ hasText: 'Fixture: preview gagal.' }).waitFor();
	assert.equal(await page.locator('iframe[title="Preview konten lesson"]').count(), 0);
	await dialog.getByRole('button', { name: 'Coba lagi', exact: true }).click();
	await livePreview.getByText('Preview setelah retry', { exact: true }).waitFor();
	await closeLessonEditor(page);
	const tips = page.getByRole('textbox', { name: 'Tips tambahan', exact: true });
	const originalTips = await tips.inputValue();
	await tips.fill('Tips preview terbaru.');
	await page
		.frameLocator('iframe[title="Preview konten lesson"]')
		.getByText('Tips preview terbaru.', { exact: false })
		.waitFor();
	await openLessonEditor(page);
	await livePreview.getByText('Tips preview terbaru.', { exact: false }).waitFor();
	await editor.fill(original);
	await waitForLessonHTML(page, original);
	await closeLessonEditor(page);
	await tips.fill(originalTips);
	await openLessonEditor(page);
	await page.getByRole('button', { name: 'Tutup editor konten pembelajaran' }).press('Escape');
	await dialog.waitFor({ state: 'hidden' });
	await page.waitForFunction(
		() => document.activeElement?.getAttribute('aria-label') === 'Buka editor konten pembelajaran'
	);
}
