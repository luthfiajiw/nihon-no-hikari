import { afterEach, describe, expect, it } from 'vitest';
import hiragana from '../../../tests/fixtures/lesson-hiragana.html?raw';
import vocabulary from '../../../tests/fixtures/lesson-vocabulary.html?raw';
import { blockRange, collectReadableBlocks, speechChunks, voices } from './text';

afterEach(() => document.body.replaceChildren());

function host(html: string) {
	const root = document.createElement('div');
	root.innerHTML = html;
	document.body.append(root);
	return root;
}

describe('lesson speech text mapping', () => {
	it('normalizes whitespace and maps entities, emoji and nested inline markup without rewriting HTML', () => {
		const root = host(
			'<section><h2>Judul</h2><p> 🎯 Setelah\n membaca <strong>あい</strong> &amp; お. </p></section>'
		);
		const before = root.innerHTML;
		const blocks = collectReadableBlocks(root);
		expect(blocks.map((block) => block.text)).toEqual(['Judul', '🎯 Setelah membaca あい & お.']);
		const block = blocks[1];
		expect(blockRange(block, block.text.indexOf('あい'), 2)?.toString()).toBe('あい');
		expect(blockRange(block, block.text.indexOf('&'), 1)?.toString()).toBe('&');
		expect(blockRange(block, 0, 2)?.toString()).toBe('🎯');
		expect(blockRange(block, block.text.indexOf('membaca'), 10)?.toString()).toBe('membaca あい');
		expect(root.innerHTML).toBe(before);
	});

	it('reads the supplied hiragana paragraphs and headings and ignores other text and recorded-audio controls', () => {
		const root = host(hiragana);
		const blocks = collectReadableBlocks(root);
		const spoken = blocks.map((block) => block.text).join('\n');
		expect(root.querySelectorAll('section')).toHaveLength(5);
		expect(blocks).toHaveLength(root.querySelectorAll('p,h1,h2,h3,h4,h5,h6').length);
		expect(blocks.every((block) => block.element.matches('p,h1,h2,h3,h4,h5,h6'))).toBe(true);
		expect(spoken.match(/Hiragana adalah/g)).toHaveLength(1);
		expect(spoken).not.toContain('💡 Baris pertama dalam Hiragana disebut あ行 (a-gyō)');
		expect(spoken).not.toContain('あい いえ うえ あお いい あう');
		expect(spoken).toContain('Tujuan Pembelajaran');
		expect(spoken).toContain('huruf あ・い・う・え・お.');
		expect(spoken).not.toContain('🔊');
		expect(root.querySelectorAll('[data-play-audio]')).toHaveLength(3);
		for (const block of blocks) {
			for (const chunk of speechChunks(block)) {
				expect(block.text.slice(chunk.offset, chunk.offset + chunk.text.length)).toBe(chunk.text);
			}
		}
	});

	it('maps all six heading levels, including inline Japanese text and line breaks, and skips hidden/empty headings', () => {
		const root = host(
			Array.from(
				{ length: 6 },
				(_, index) =>
					`<h${index + 1}>Judul ${index + 1} <strong>あい</strong><br><span>lanjutan</span></h${index + 1}>`
			).join('') + '<h4 hidden>Rahasia</h4><h5> </h5><h6 style="display:none">Sembunyi</h6>'
		);
		const blocks = collectReadableBlocks(root);
		expect(blocks.map((block) => block.element.tagName)).toEqual([
			'H1',
			'H2',
			'H3',
			'H4',
			'H5',
			'H6'
		]);
		for (const [index, block] of blocks.entries()) {
			expect(block.text).toBe(`Judul ${index + 1} あい lanjutan`);
			expect(blockRange(block, block.text.indexOf('あい'), 2)?.toString()).toBe('あい');
		}
	});

	it('handles paragraphs inside nested containers and ignores bare table/list text, hidden and empty paragraphs', () => {
		const root = host(
			vocabulary +
				'<section><section><p>Satu<br>dua</p></section><div hidden><p>Rahasia</p></div><p style="display:none">Sembunyi</p><p aria-hidden="true">Dekorasi</p><p> </p><p><img alt="Gambar"></p><ul><li>Daftar biasa</li><li><p>Paragraf daftar</p></li></ul><table><tbody><tr><td><p>Paragraf tabel</p></td></tr></tbody></table></section>'
		);
		const text = collectReadableBlocks(root)
			.map((block) => block.text)
			.join('\n');
		expect(text).toBe(
			'3. Contoh Kosakata\nLatih membaca kosakata hiragana berikut.\nSatu dua\nParagraf daftar\nParagraf tabel'
		);
		expect(text.match(/Satu dua/g)).toHaveLength(1);
		expect(text).not.toMatch(/Rahasia|Sembunyi|Dekorasi|Dengarkan|Daftar biasa/);
	});

	it('switches voices by script and keeps UTF-16 offsets through punctuation and surrogate pairs', () => {
		const block = collectReadableBlocks(host('<p>🎯 Huruf あ・い・う, lalu 日本語.</p>'))[0];
		const chunks = speechChunks(block);
		expect(chunks.map(({ voice }) => voice)).toEqual([voices.id, voices.ja, voices.id, voices.ja]);
		expect(chunks.map(({ text }) => text)).toEqual(['🎯 Huruf', 'あ・い・う,', 'lalu', '日本語.']);
		for (const chunk of chunks)
			expect(blockRange(block, chunk.offset, chunk.text.length)?.toString()).toBe(chunk.text);
	});

	it('splits long sentences at safe boundaries and never breaks a surrogate pair', () => {
		const block = collectReadableBlocks(
			host(`<p>${'Materi pendek. '.repeat(120)}${'あ'.repeat(999)}🎯あ</p>`)
		)[0];
		const chunks = speechChunks(block);
		expect(chunks.length).toBeGreaterThan(3);
		for (const chunk of chunks) {
			expect(chunk.text.length).toBeLessThanOrEqual(1000);
			expect(chunk.text.isWellFormed()).toBe(true);
		}
	});
});
