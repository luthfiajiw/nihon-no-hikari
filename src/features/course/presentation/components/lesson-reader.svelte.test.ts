import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { tick } from 'svelte';
import type { SynthesizedSpeech } from '$lib/lesson-speech/azure';
import LessonReader from './lesson-reader.svelte';

const mock = vi.hoisted(() => ({
	requests: [] as {
		signal: AbortSignal;
		resolve: (speech: SynthesizedSpeech) => void;
		reject: (error: Error) => void;
	}[]
}));
vi.mock('$lib/lesson-speech/azure', () => ({
	AzureLessonSpeech: class {
		synthesize(_text: string, _voice: string, signal: AbortSignal) {
			return new Promise<SynthesizedSpeech>((resolve, reject) => {
				mock.requests.push({ signal, resolve, reject });
			});
		}
	}
}));

afterEach(() => {
	mock.requests.length = 0;
	vi.unstubAllGlobals();
});

describe('LessonReader component lifecycle', () => {
	it('rebuilds mappings and cancels speech on lesson/content changes and unmount', async () => {
		const decode = vi.fn();
		const close = vi.fn(async () => {});
		vi.stubGlobal(
			'AudioContext',
			class {
				resume = vi.fn(async () => {});
				close = close;
				decodeAudioData = decode;
			}
		);
		const view = await render(LessonReader, {
			lessonId: 'one',
			content: '<section><p>Materi pertama</p></section>'
		});
		const button = view.container.querySelector<HTMLButtonElement>('[data-scope="block"]')!;
		expect(button).not.toBeNull();
		button.click();
		await vi.waitFor(() => expect(mock.requests).toHaveLength(1));
		expect(button.getAttribute('aria-busy')).toBe('true');
		await view.rerender({ lessonId: 'two', content: '<p>Materi kedua</p>' });
		expect(mock.requests[0].signal.aborted).toBe(true);
		mock.requests[0].resolve({ audio: new ArrayBuffer(8), words: [] });
		await tick();
		expect(decode).not.toHaveBeenCalled();
		const next = view.container.querySelector<HTMLButtonElement>('[data-scope="block"]')!;
		expect(next.getAttribute('aria-label')).toContain('Materi kedua');
		next.click();
		await vi.waitFor(() => expect(mock.requests).toHaveLength(2));
		await view.unmount();
		expect(mock.requests[1].signal.aborted).toBe(true);
		mock.requests[1].resolve({ audio: new ArrayBuffer(8), words: [] });
		expect(close).toHaveBeenCalledTimes(2);
	});

	it('shows an accessible failure and retries only after the user asks', async () => {
		vi.stubGlobal(
			'AudioContext',
			class {
				resume = vi.fn(async () => {});
				close = vi.fn(async () => {});
			}
		);
		const view = await render(LessonReader, { lessonId: 'one', content: '<p>Materi</p>' });
		view.container.querySelector<HTMLButtonElement>('[data-scope="block"]')!.click();
		await vi.waitFor(() => expect(mock.requests).toHaveLength(1));
		mock.requests[0].reject(new Error('Fitur baca lesson belum dikonfigurasi.'));
		await vi.waitFor(() =>
			expect(view.container.querySelector('[role="alert"]')?.textContent).toContain(
				'belum dikonfigurasi'
			)
		);
		expect(mock.requests).toHaveLength(1);
		(view.container.querySelector('[role="alert"] button') as HTMLButtonElement).click();
		await vi.waitFor(() => expect(mock.requests).toHaveLength(2));
		await view.unmount();
		mock.requests[1].reject(new DOMException('Aborted', 'AbortError'));
	});
});
