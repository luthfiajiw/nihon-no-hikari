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

export async function testLessonEditor(page) {
	const htmlTab = page.getByRole('tab', { name: 'HTML', exact: true });
	const previewTab = page.getByRole('tab', { name: 'Preview', exact: true });
	assert.equal(await htmlTab.getAttribute('aria-selected'), 'true');
	const editor = page.getByRole('textbox', { name: 'Kode HTML', exact: true });
	await editor.waitFor();
	assert.equal(await editor.getAttribute('contenteditable'), 'true');
	assert.equal(await editor.getAttribute('spellcheck'), 'false');
	assert.equal(await editor.getAttribute('aria-describedby'), 'lesson-html-help');
	const tabListBounds = await page
		.getByRole('tablist', { name: 'Mode konten pembelajaran' })
		.boundingBox();
	const editorBounds = await editor.boundingBox();
	assert(tabListBounds.y + tabListBounds.height <= editorBounds.y, 'Tabs sit above the editor');
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
	await editor.evaluate((element) => {
		element.dataset.editorInstance = 'preserved';
	});
	await htmlTab.focus();
	await htmlTab.press('ArrowRight');
	assert.equal(await previewTab.getAttribute('aria-selected'), 'true');
	await page.locator('iframe[title="Preview konten lesson"]').waitFor();
	assert(!(await editor.isVisible()), 'HTML editor is hidden during preview');
	await previewTab.press('ArrowLeft');
	assert.equal(await htmlTab.getAttribute('aria-selected'), 'true');
	assert.equal(await editor.getAttribute('data-editor-instance'), 'preserved');
	await editor.focus();
	await editor.press('Control+z');
	assert.notEqual(await lessonHTMLValue(page), '<p>あ</p>!', 'Undo survives preview switching');
	await editor.press('Control+y');
	await waitForLessonHTML(page, '<p>あ</p>!');
	await editor.pressSequentially('?');
	await waitForLessonHTML(page, '<p>あ</p>!?');

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
	await previewTab.click();
	await page.getByRole('alert').filter({ hasText: 'Fixture: preview gagal.' }).waitFor();
	assert.equal(await page.locator('iframe[title="Preview konten lesson"]').count(), 0);
	await page.getByRole('button', { name: 'Coba lagi', exact: true }).click();
	await page.locator('iframe[title="Preview konten lesson"]').waitFor();
	const tips = page.getByRole('textbox', { name: 'Tips tambahan', exact: true });
	const originalTips = await tips.inputValue();
	await tips.fill('Tips preview terbaru.');
	await page
		.frameLocator('iframe[title="Preview konten lesson"]')
		.getByText('Tips preview terbaru.', { exact: false })
		.waitFor();
	await tips.fill(originalTips);
	await htmlTab.click();

	await editor.fill(original);
	await waitForLessonHTML(page, original);
}
