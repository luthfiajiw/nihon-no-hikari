import { describe, expect, it, vi } from 'vitest';
import { KanaTemplatesUseCase, parseKanaTemplateInput } from './kana-templates.usecase';
import type { AdminRepository } from '../repositories/admin.repository';
import { MAX_KANA_SVG_BYTES } from '../entities/kana-template.entity';

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
	it('requires SVG for creation/preview and allows metadata-only edits', async () => {
		const repository = {
			getTemplates: vi.fn(),
			getTemplate: vi.fn(),
			previewTemplate: vi.fn(),
			saveTemplate: vi.fn()
		};
		const usecase = new KanaTemplatesUseCase(repository as unknown as AdminRepository);
		expect(() => usecase.save(null, metadata)).toThrow('File SVG');
		expect(() => usecase.preview(metadata)).toThrow('File SVG');
		await usecase.save('existing', metadata);
		expect(repository.saveTemplate).toHaveBeenCalledWith('existing', metadata);
		await usecase.preview({ ...metadata, svg_content: '<svg />' });
		expect(repository.previewTemplate).toHaveBeenCalledWith({
			...metadata,
			svg_content: '<svg />'
		});
	});
});
