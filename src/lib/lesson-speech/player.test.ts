import { describe, expect, it } from 'vitest';
import { SpeechCache } from './player';

describe('speech audio LRU cache', () => {
	it('evicts by byte size, refreshes recency and rejects oversized entries', () => {
		const cache = new SpeechCache(8);
		const value = (bytes: number) => ({ audio: new ArrayBuffer(bytes), words: [] });
		cache.set('a', value(4));
		cache.set('b', value(4));
		expect(cache.get('a')).toBeDefined();
		cache.set('c', value(4));
		expect(cache.get('b')).toBeUndefined();
		expect(cache.get('a')).toBeDefined();
		cache.set('c', value(2));
		cache.set('d', value(2));
		expect(cache.get('a')).toBeDefined();
		cache.set('huge', value(9));
		expect(cache.get('huge')).toBeUndefined();
		cache.clear();
		expect(cache.get('a')).toBeUndefined();
	});
});
