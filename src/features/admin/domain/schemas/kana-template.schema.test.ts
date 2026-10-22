import { describe, expect, it } from 'vitest';
import { kanaTemplateInputSchema, kanaTemplateUploadSchema } from './admin-request.schema';
import { parseRequest } from '$lib/server/validation';
import { MAX_KANA_SVG_BYTES } from '../entities/kana-template.entity';

function parseKanaTemplateInput(value: unknown) {
	return parseRequest(kanaTemplateInputSchema, value);
}

const metadata = { script: 'hiragana', character: 'あ', romaji: 'a', source_version: 'test' };

describe('kana template workflows', () => {
	it('normalizes metadata and preserves optional SVG replacement', () => {
		expect(
			parseKanaTemplateInput({
				...metadata,
				character: 'か\u3099',
				romaji: ' ga ',
				source_version: ' test '
			})
		).toEqual({ ...metadata, character: 'が', romaji: 'ga' });
		expect(parseKanaTemplateInput({ ...metadata, svg_content: '<svg />' })).toMatchObject({
			svg_content: '<svg />'
		});
	});
	it.each([
		null,
		[],
		{},
		{ ...metadata, script: 'kanji' },
		{ ...metadata, character: 'カ' },
		{ ...metadata, character: 'あい' },
		{ ...metadata, romaji: '123456789' },
		{ ...metadata, source_version: ' ' },
		{ ...metadata, stroke_data: {} },
		{ ...metadata, svg_content: null }
	])('rejects malformed input %#', (input) => {
		expect(() => parseKanaTemplateInput(input)).toThrow();
	});
	it('limits upload bytes including multibyte content', () => {
		expect(() =>
			parseKanaTemplateInput({
				...metadata,
				svg_content: 'あ'.repeat(Math.ceil(MAX_KANA_SVG_BYTES / 3))
			})
		).toThrow(expect.objectContaining({ status: 413 }));
	});
	it('requires SVG for creation/preview and allows metadata-only edits', () => {
		expect(() => parseRequest(kanaTemplateUploadSchema, metadata)).toThrow('File SVG');
		expect(parseKanaTemplateInput(metadata)).toEqual(metadata);
		expect(parseRequest(kanaTemplateUploadSchema, { ...metadata, svg_content: '<svg />' })).toEqual(
			{
				...metadata,
				svg_content: '<svg />'
			}
		);
	});
});
