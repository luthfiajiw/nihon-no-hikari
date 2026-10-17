import assert from 'node:assert/strict';

export async function testCourseReorder({
	page,
	context,
	course,
	modules,
	lessons,
	mutations,
	failNext,
	holdMutation,
	origin,
	screenshotDir
}) {
	const moduleRows = page.locator('.admin-stack > [data-module-id]');
	const moduleIds = () => moduleRows.evaluateAll((rows) => rows.map((row) => row.dataset.moduleId));
	const lessonRows = page.locator(`[data-module-id="${modules[0].id}"] [data-lesson-id]`);
	const lessonIds = () => lessonRows.evaluateAll((rows) => rows.map((row) => row.dataset.lessonId));
	const saved = async () => {
		await page.getByRole('status').filter({ hasText: 'Urutan berhasil disimpan.' }).waitFor();
		await page.locator('.admin-stack[aria-busy="false"]').waitFor();
	};
	let verifiedAnimation = false;
	let capturedPreview = false;
	const keyboardMove = async (handle, direction) => {
		await handle.focus();
		await handle.press('Space');
		const animation =
			!verifiedAnimation &&
			page.waitForFunction(
				() =>
					Array.from(document.querySelectorAll('[data-sort-id]')).some((row) =>
						row.getAnimations().some((animation) => animation.effect?.getTiming().duration === 220)
					),
				undefined,
				{ polling: 'raf', timeout: 5000 }
			);
		await page.keyboard.press(direction);
		if (animation) {
			await animation;
			verifiedAnimation = true;
		}
		await page.keyboard.press('Enter');
		await saved();
	};
	const mouseMove = async (handle, target, edge) => {
		await handle.scrollIntoViewIfNeeded();
		const source = await handle.boundingBox();
		const destination = await target.boundingBox();
		assert(source && destination);
		await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
		await page.mouse.down();
		await page.mouse.move(
			destination.x + 10,
			destination.y + (edge === 'before' ? 2 : destination.height - 2),
			{ steps: 8 }
		);
		// Allow the library's hit testing and FLIP preview to settle before releasing.
		await page.waitForTimeout(300);
		await page.locator('#dnd-action-dragged-el').waitFor({ state: 'visible' });
		if (!capturedPreview) {
			await page.screenshot({ path: `${screenshotDir}/course-detail-dnd-preview.png` });
			capturedPreview = true;
		}
		await page.mouse.up();
	};
	const firstModule = page.locator(`[data-module-id="${modules[0].id}"]`);
	await firstModule.locator('summary').click({ position: { x: 110, y: 25 } });
	assert.equal(await firstModule.evaluate((node) => node.open), false);
	await mouseMove(
		page.getByRole('button', { name: 'Geser module Kanji', exact: true }),
		firstModule,
		'before'
	);
	await saved();
	assert.deepEqual(await moduleIds(), [modules[2].id, modules[0].id, modules[1].id]);
	assert.equal(
		await firstModule.evaluate((node) => node.open),
		false,
		'Reorder preserves collapsed state by ID'
	);
	await page.reload({ waitUntil: 'networkidle' });
	assert.deepEqual(
		await moduleIds(),
		[modules[2].id, modules[0].id, modules[1].id],
		'Module order survives reload'
	);
	await keyboardMove(
		page.getByRole('button', { name: 'Geser module Kanji', exact: true }),
		'ArrowDown'
	);
	await keyboardMove(
		page.getByRole('button', { name: 'Geser module Kanji', exact: true }),
		'ArrowDown'
	);
	assert.deepEqual(
		await moduleIds(),
		modules.map((item) => item.id)
	);
	const firstLessonHandle = page.getByRole('button', {
		name: 'Geser lesson Baris A (あ)',
		exact: true
	});
	const noOpCount = mutations.length;
	await firstLessonHandle.focus();
	await firstLessonHandle.press('Space');
	await page.keyboard.press('Enter');
	await firstLessonHandle.focus();
	await firstLessonHandle.press('Space');
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('Escape');
	await page.waitForLoadState('networkidle');
	assert.equal(mutations.length, noOpCount, 'No-op and cancelled gestures never save');
	await page.evaluate(async () => {
		await Promise.all(
			Array.from(document.querySelectorAll('[data-sort-id]')).flatMap((row) =>
				row.getAnimations().map((animation) => animation.finished.catch(() => {}))
			)
		);
	});
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await firstLessonHandle.focus();
	await firstLessonHandle.press('Space');
	await page.keyboard.press('ArrowDown');
	assert(
		await page
			.locator('[data-sort-id]')
			.evaluateAll((rows) =>
				rows.every((row) =>
					row.getAnimations().every((animation) => animation.effect?.getTiming().duration === 0)
				)
			),
		'Reduced motion disables FLIP animation'
	);
	await page.keyboard.press('Escape');
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	const release = holdMutation();
	try {
		await mouseMove(firstLessonHandle, lessonRows.nth(1), 'after');
		await page.getByRole('status').filter({ hasText: 'Menyimpan urutan' }).waitFor();
		assert.equal(
			await page.locator('[data-sort-handle][aria-disabled="false"]').count(),
			0,
			'All reorder handles are disabled during save'
		);
		assert.deepEqual(
			await lessonIds(),
			[lessons[1].id, lessons[0].id],
			'Drop updates order immediately'
		);
	} finally {
		release();
	}
	await saved();
	assert.deepEqual(
		await moduleIds(),
		modules.map((item) => item.id),
		'Nested lesson drag leaves modules in place'
	);
	await page.reload({ waitUntil: 'networkidle' });
	assert.deepEqual(
		await lessonIds(),
		[lessons[1].id, lessons[0].id],
		'Lesson order survives reload'
	);
	const boxes = await lessonRows.evaluateAll((rows) =>
		rows.map((row) => {
			const rect = row.getBoundingClientRect();
			return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
		})
	);
	assert.equal(boxes[0].x, boxes[1].x);
	assert.equal(boxes[0].width, boxes[1].width);
	assert(boxes[1].y >= boxes[0].y + boxes[0].height, 'Desktop lessons use one column');
	const beforeForeignDrop = mutations.length;
	await mouseMove(
		firstLessonHandle,
		page.locator(`[data-module-id="${modules[1].id}"] summary`),
		'after'
	);
	await page.waitForLoadState('networkidle');
	assert.equal(mutations.length, beforeForeignDrop, 'Lessons cannot move between modules');
	failNext();
	const failingHandle = page.getByRole('button', {
		name: 'Geser lesson Baris KA (か)',
		exact: true
	});
	await failingHandle.focus();
	await failingHandle.press('Space');
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('Enter');
	await page.getByRole('status').filter({ hasText: 'Fixture: operasi gagal.' }).waitFor();
	await page.locator('.admin-stack[aria-busy="false"]').waitFor();
	assert.deepEqual(
		await lessonIds(),
		[lessons[1].id, lessons[0].id],
		'Failed save restores server order'
	);
	// Native Chromium touch events exercise pointer capture rather than synthetic DOM events.
	const cdp = await context.newCDPSession(page);
	await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
	await page.setViewportSize({ width: 390, height: 844 });
	await firstLessonHandle.scrollIntoViewIfNeeded();
	const touchSource = await firstLessonHandle.boundingBox();
	const touchTarget = await lessonRows.first().boundingBox();
	assert(touchSource && touchTarget);
	const point = {
		x: touchSource.x + touchSource.width / 2,
		y: touchSource.y + touchSource.height / 2
	};
	await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] });
	await cdp.send('Input.dispatchTouchEvent', {
		type: 'touchMove',
		touchPoints: [{ x: point.x, y: touchTarget.y + 2 }]
	});
	await page.waitForTimeout(300);
	await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
	await saved();
	assert.deepEqual(
		await lessonIds(),
		lessons.map((item) => item.id),
		'Touch reorders within the module'
	);
	assert(
		await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
		'Reorder controls fit mobile'
	);
	await page.screenshot({
		path: `${screenshotDir}/course-detail-reorder-mobile.png`,
		fullPage: true
	});
	await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: false });
	await cdp.detach();
	await page.setViewportSize({ width: 390, height: 500 });
	const scrollingHandle = page.getByRole('button', { name: 'Geser module Hiragana', exact: true });
	await scrollingHandle.scrollIntoViewIfNeeded();
	const scrollSource = await scrollingHandle.boundingBox();
	assert(scrollSource);
	const beforeScroll = await page.locator('main > section').evaluate((node) => node.scrollTop);
	const beforeScrollMutations = mutations.length;
	await page.mouse.move(
		scrollSource.x + scrollSource.width / 2,
		scrollSource.y + scrollSource.height / 2
	);
	await page.mouse.down();
	await page.mouse.move(scrollSource.x + scrollSource.width / 2, 490, { steps: 5 });
	try {
		await page.waitForFunction(
			(before) => document.querySelector('main > section').scrollTop > before + 5,
			beforeScroll
		);
	} finally {
		await page.keyboard.press('Escape');
		await page.mouse.up();
	}
	await page.locator('#dnd-action-dragged-el').waitFor({ state: 'detached' });
	assert.deepEqual(
		await moduleIds(),
		modules.map((item) => item.id),
		'Pointer cancellation restores the original module order'
	);
	assert.equal(
		mutations.length,
		beforeScrollMutations,
		'Escape cancels a pointer drag after auto-scroll'
	);
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.locator(`.admin-stack [data-lesson-id="${lessons[0].id}"] > button`).click();
	await page.waitForURL(`**/admin/content/lesson/${lessons[0].id}`);
	await page.goto(`${origin}/admin/courses/${course.id}`, { waitUntil: 'networkidle' });
}
