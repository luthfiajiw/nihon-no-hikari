import type { Action } from 'svelte/action';

export type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'zoom' | 'none';

export interface RevealOptions {
	direction?: RevealDirection;
	delay?: number;
	duration?: number;
	distance?: number;
	threshold?: number;
	rootMargin?: string;
	disabled?: boolean;
	once?: boolean;
}

interface ObserverEntry {
	observer: IntersectionObserver;
	callbacks: Map<Element, (entry: IntersectionObserverEntry) => void>;
}

const observerPool = new Map<string, ObserverEntry>();

function getObserverKey(threshold: number, rootMargin: string): string {
	return `${threshold}_${rootMargin}`;
}

function getSharedObserver(
	threshold: number,
	rootMargin: string,
	element: HTMLElement,
	callback: (entry: IntersectionObserverEntry) => void
): () => void {
	if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
		return () => {};
	}

	const key = getObserverKey(threshold, rootMargin);
	let poolEntry = observerPool.get(key);

	if (!poolEntry) {
		const callbacks = new Map<Element, (entry: IntersectionObserverEntry) => void>();
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					const cb = callbacks.get(entry.target);
					if (cb) {
						cb(entry);
					}
				}
			},
			{ threshold, rootMargin }
		);

		poolEntry = { observer, callbacks };
		observerPool.set(key, poolEntry);
	}

	poolEntry.callbacks.set(element, callback);
	poolEntry.observer.observe(element);

	return () => {
		const currentPool = observerPool.get(key);
		if (!currentPool) return;

		currentPool.observer.unobserve(element);
		currentPool.callbacks.delete(element);

		if (currentPool.callbacks.size === 0) {
			currentPool.observer.disconnect();
			observerPool.delete(key);
		}
	};
}

function updateElementStyles(node: HTMLElement, opts: RevealOptions) {
	node.dataset.reveal = '';
	node.dataset.revealDirection = opts.direction ?? 'up';

	if (opts.delay !== undefined && opts.delay > 0) {
		node.style.setProperty('--reveal-delay', `${opts.delay}ms`);
	} else {
		node.style.removeProperty('--reveal-delay');
	}

	if (opts.duration !== undefined && opts.duration > 0) {
		node.style.setProperty('--reveal-duration', `${opts.duration}ms`);
	} else {
		node.style.removeProperty('--reveal-duration');
	}

	if (opts.distance !== undefined && opts.distance >= 0) {
		node.style.setProperty('--reveal-distance', `${opts.distance}px`);
	} else {
		node.style.removeProperty('--reveal-distance');
	}
}

export const viewportReveal: Action<HTMLElement, RevealOptions | undefined> = (
	node: HTMLElement,
	initialOptions: RevealOptions = {}
) => {
	let currentOptions = { ...initialOptions };
	let cleanupObserver: (() => void) | null = null;

	function setup() {
		if (cleanupObserver) {
			cleanupObserver();
			cleanupObserver = null;
		}

		if (currentOptions.disabled) {
			node.removeAttribute('data-reveal');
			node.removeAttribute('data-reveal-state');
			node.removeAttribute('data-reveal-direction');
			node.style.removeProperty('--reveal-delay');
			node.style.removeProperty('--reveal-duration');
			node.style.removeProperty('--reveal-distance');
			return;
		}

		updateElementStyles(node, currentOptions);

		// Determine initial placement relative to viewport
		if (typeof window !== 'undefined') {
			const rect = node.getBoundingClientRect();
			const windowHeight = window.innerHeight || document.documentElement.clientHeight;
			if (rect.bottom < 0) {
				node.dataset.revealState = 'hidden-top';
			} else if (rect.top > windowHeight) {
				node.dataset.revealState = 'hidden-bottom';
			} else {
				node.dataset.revealState = 'hidden-bottom';
			}
		} else {
			node.dataset.revealState = 'hidden-bottom';
		}

		const threshold = currentOptions.threshold ?? 0.12;
		const rootMargin = currentOptions.rootMargin ?? '0px 0px -40px 0px';

		cleanupObserver = getSharedObserver(threshold, rootMargin, node, (entry) => {
			if (entry.isIntersecting) {
				node.dataset.revealState = 'visible';
				if (currentOptions.once && cleanupObserver) {
					cleanupObserver();
					cleanupObserver = null;
				}
			} else {
				if (!currentOptions.once) {
					const rootTop = entry.rootBounds ? entry.rootBounds.top : 0;
					if (entry.boundingClientRect.top < rootTop) {
						node.dataset.revealState = 'hidden-top';
					} else {
						node.dataset.revealState = 'hidden-bottom';
					}
				}
			}
		});
	}

	setup();

	return {
		update(newOptions?: RevealOptions) {
			currentOptions = { ...(newOptions ?? {}) };
			setup();
		},
		destroy() {
			if (cleanupObserver) {
				cleanupObserver();
				cleanupObserver = null;
			}
		}
	};
};
