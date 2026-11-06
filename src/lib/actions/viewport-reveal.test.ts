// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { viewportReveal } from './viewport-reveal';

describe('viewportReveal action', () => {
	let element: HTMLElement;
	let observeMock: ReturnType<typeof vi.fn>;
	let unobserveMock: ReturnType<typeof vi.fn>;
	let disconnectMock: ReturnType<typeof vi.fn>;
	let observerCallback: (entries: IntersectionObserverEntry[]) => void;

	beforeEach(() => {
		element = document.createElement('div');
		document.body.appendChild(element);

		observeMock = vi.fn();
		unobserveMock = vi.fn();
		disconnectMock = vi.fn();

		class MockIntersectionObserver {
			constructor(callback: (entries: IntersectionObserverEntry[]) => void) {
				observerCallback = callback;
			}
			observe = observeMock;
			unobserve = unobserveMock;
			disconnect = disconnectMock;
		}

		vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
	});

	afterEach(() => {
		document.body.removeChild(element);
		vi.unstubAllGlobals();
	});

	it('initializes with default data attributes and styles', () => {
		const action = viewportReveal(element);

		expect(element.dataset.reveal).toBe('');
		expect(element.dataset.revealDirection).toBe('up');
		expect(element.dataset.revealState).toBe('hidden-bottom');
		expect(observeMock).toHaveBeenCalledWith(element);

		action?.destroy?.();
	});

	it('configures custom direction, delay, duration, and distance', () => {
		const action = viewportReveal(element, {
			direction: 'left',
			delay: 150,
			duration: 800,
			distance: 40
		});

		expect(element.dataset.revealDirection).toBe('left');
		expect(element.style.getPropertyValue('--reveal-delay')).toBe('150ms');
		expect(element.style.getPropertyValue('--reveal-duration')).toBe('800ms');
		expect(element.style.getPropertyValue('--reveal-distance')).toBe('40px');

		action?.destroy?.();
	});

	it('transitions to visible when intersecting', () => {
		const action = viewportReveal(element);

		observerCallback([
			{
				target: element,
				isIntersecting: true,
				boundingClientRect: { top: 100 } as DOMRectReadOnly,
				rootBounds: { top: 0 } as DOMRectReadOnly
			} as unknown as IntersectionObserverEntry
		]);

		expect(element.dataset.revealState).toBe('visible');

		action?.destroy?.();
	});

	it('transitions to hidden-top when element exits above viewport', () => {
		const action = viewportReveal(element);

		// First make visible
		observerCallback([
			{
				target: element,
				isIntersecting: true,
				boundingClientRect: { top: 100 } as DOMRectReadOnly,
				rootBounds: { top: 0 } as DOMRectReadOnly
			} as unknown as IntersectionObserverEntry
		]);
		expect(element.dataset.revealState).toBe('visible');

		// Now exit past top
		observerCallback([
			{
				target: element,
				isIntersecting: false,
				boundingClientRect: { top: -50 } as DOMRectReadOnly,
				rootBounds: { top: 0 } as DOMRectReadOnly
			} as unknown as IntersectionObserverEntry
		]);
		expect(element.dataset.revealState).toBe('hidden-top');

		action?.destroy?.();
	});

	it('transitions to hidden-bottom when element exits below viewport', () => {
		const action = viewportReveal(element);

		// First make visible
		observerCallback([
			{
				target: element,
				isIntersecting: true,
				boundingClientRect: { top: 100 } as DOMRectReadOnly,
				rootBounds: { top: 0 } as DOMRectReadOnly
			} as unknown as IntersectionObserverEntry
		]);
		expect(element.dataset.revealState).toBe('visible');

		// Now exit past bottom
		observerCallback([
			{
				target: element,
				isIntersecting: false,
				boundingClientRect: { top: 800 } as DOMRectReadOnly,
				rootBounds: { top: 0 } as DOMRectReadOnly
			} as unknown as IntersectionObserverEntry
		]);
		expect(element.dataset.revealState).toBe('hidden-bottom');

		action?.destroy?.();
	});

	it('cleans up observer on destroy', () => {
		const action = viewportReveal(element);
		action?.destroy?.();

		expect(unobserveMock).toHaveBeenCalledWith(element);
	});

	it('removes reveal attributes when disabled', () => {
		const action = viewportReveal(element, { delay: 100 });
		action?.update?.({ disabled: true });

		expect(element.dataset.reveal).toBeUndefined();
		expect(element.dataset.revealState).toBeUndefined();
		expect(element.style.getPropertyValue('--reveal-delay')).toBe('');

		action?.destroy?.();
	});
});
