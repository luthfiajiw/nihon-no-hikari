import { beforeEach, describe, expect, it, vi } from 'vitest';
import { page as browserPage } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import Fixture from './app-sidebar.test-fixture.svelte';
import '../../routes/layout.css';

const navigationMock = vi.hoisted(() => ({
	goto: vi.fn<(href: string) => Promise<void>>()
}));

const routeState = $state({
	url: new URL('http://localhost/'),
	data: { user: { role: 'Admin' } },
	to: null as { url: URL } | null
});

vi.mock('$app/state', () => ({
	page: {
		get url() {
			return routeState.url;
		},
		get data() {
			return routeState.data;
		}
	},
	navigating: {
		get to() {
			return routeState.to;
		}
	}
}));

vi.mock('$app/navigation', () => ({
	goto: (href: string) => navigationMock.goto(href)
}));

vi.mock('$app/paths', () => ({
	resolve: (pathname: string) => pathname
}));

describe('AppSidebar mobile route dismissal', () => {
	beforeEach(() => {
		routeState.url = new URL('http://localhost/');
		routeState.data = { user: { role: 'Admin' } };
		routeState.to = null;
		navigationMock.goto.mockReset();
		navigationMock.goto.mockImplementation(async (href: string) => {
			routeState.url = new URL(href, 'http://localhost');
		});
	});

	it('closes the mobile sidebar whenever the route changes', async () => {
		await browserPage.viewport(390, 844);
		const view = await render(Fixture);

		try {
			expect(document.querySelector('[data-slot="sidebar"][data-mobile="true"]')).toBeNull();

			const trigger = view.container.querySelector<HTMLButtonElement>(
				'[data-slot="sidebar-trigger"]'
			)!;
			trigger.click();

			await vi.waitFor(() => {
				expect(document.querySelector('[data-slot="sidebar"][data-mobile="true"]')).not.toBeNull();
			});

			const kursusButton = Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(
				(button) => button.textContent?.trim() === 'Kursus'
			)!;
			kursusButton.click();

			await vi.waitFor(() => {
				expect(navigationMock.goto).toHaveBeenCalledWith('/courses');
				expect(document.querySelector('[data-slot="sidebar"][data-mobile="true"]')).toBeNull();
			});

			// Re-open and verify non-menu route changes (e.g. history navigation or slow in-flight load) also close it
			trigger.click();
			await vi.waitFor(() => {
				expect(document.querySelector('[data-slot="sidebar"][data-mobile="true"]')).not.toBeNull();
			});

			routeState.to = { url: new URL('http://localhost/admin') };
			await vi.waitFor(() => {
				expect(document.querySelector('[data-slot="sidebar"][data-mobile="true"]')).toBeNull();
			});
		} finally {
			await view.unmount();
		}
	});

	it('keeps the desktop sidebar expanded when the route changes', async () => {
		await browserPage.viewport(1280, 800);
		const view = await render(Fixture, { open: true });

		try {
			await vi.waitFor(() => {
				expect(
					view.container.querySelector('[data-slot="sidebar"]')?.getAttribute('data-state')
				).toBe('expanded');
			});

			const kursusButton = Array.from(
				view.container.querySelectorAll<HTMLButtonElement>('button')
			).find((button) => button.textContent?.trim() === 'Kursus')!;
			kursusButton.click();

			await vi.waitFor(() => {
				expect(navigationMock.goto).toHaveBeenCalledWith('/courses');
			});

			expect(
				view.container.querySelector('[data-slot="sidebar"]')?.getAttribute('data-state')
			).toBe('expanded');
		} finally {
			await view.unmount();
		}
	});
});
