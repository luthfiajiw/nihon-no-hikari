import { expect, it } from 'vitest';
import { mount, unmount } from 'svelte';
import Fixture from './sidebar-menu-button.test-fixture.svelte';
import '../../../../routes/layout.css';

it('keeps inactive menu backgrounds transparent and highlights only the active menu', async () => {
	const target = document.createElement('div');
	document.body.append(target);
	const component = mount(Fixture, { target });
	try {
		const buttons = target.querySelectorAll<HTMLButtonElement>('[data-sidebar="menu-button"]');
		expect(buttons).toHaveLength(3);
		for (const index of [0, 2]) {
			expect(buttons[index].hasAttribute('data-active')).toBe(false);
			expect(getComputedStyle(buttons[index]).backgroundColor).toBe('rgba(0, 0, 0, 0)');
		}
		expect(buttons[1].hasAttribute('data-active')).toBe(true);
		expect(getComputedStyle(buttons[1]).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
	} finally {
		await unmount(component);
		target.remove();
	}
});
