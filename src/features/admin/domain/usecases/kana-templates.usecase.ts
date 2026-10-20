import { AdminError } from '../entities/admin.entity';
import { MAX_KANA_SVG_BYTES, type KanaTemplateInput } from '../entities/kana-template.entity';
import type { AdminRepository } from '../repositories/admin.repository';

export function parseKanaTemplateInput(value: unknown): KanaTemplateInput {
	if (!value || typeof value !== 'object' || Array.isArray(value))
		throw new AdminError(400, 'Data template tidak valid.');
	const item = value as Record<string, unknown>;
	if (
		Object.keys(item).some(
			(key) => !['script', 'character', 'romaji', 'source_version', 'svg_content'].includes(key)
		)
	)
		throw new AdminError(400, 'Field template tidak valid.');
	if (!['hiragana', 'katakana'].includes(String(item.script)))
		throw new AdminError(400, 'Pilih script hiragana atau katakana.');
	for (const key of ['character', 'romaji', 'source_version']) {
		if (typeof item[key] !== 'string' || !item[key].trim() || item[key].includes('\0'))
			throw new AdminError(400, 'Karakter, romaji, dan versi sumber wajib diisi.');
	}
	const character = (item.character as string).trim().normalize('NFC');
	if (
		[...character].length !== 1 ||
		!/^\p{Letter}$/u.test(character) ||
		!(item.script === 'hiragana' ? /^\p{Script=Hiragana}$/u : /^\p{Script=Katakana}$/u).test(
			character
		)
	)
		throw new AdminError(400, 'Karakter harus berupa satu kana sesuai script.');
	const romaji = (item.romaji as string).trim();
	if ([...romaji].length > 8) throw new AdminError(400, 'Romaji maksimal 8 karakter.');
	if (item.svg_content !== undefined && typeof item.svg_content !== 'string')
		throw new AdminError(400, 'SVG tidak valid.');
	if (
		typeof item.svg_content === 'string' &&
		new TextEncoder().encode(item.svg_content).length > MAX_KANA_SVG_BYTES
	)
		throw new AdminError(413, 'Ukuran SVG maksimal 256 KiB.');
	return {
		script: item.script as KanaTemplateInput['script'],
		character,
		romaji,
		source_version: (item.source_version as string).trim(),
		...(item.svg_content !== undefined ? { svg_content: item.svg_content as string } : {})
	};
}

export class KanaTemplatesUseCase {
	constructor(private readonly repository: AdminRepository) {}
	list() {
		return this.repository.getTemplates();
	}
	detail(id: string) {
		return this.repository.getTemplate(id);
	}
	preview(value: unknown) {
		const input = parseKanaTemplateInput(value);
		if (!input.svg_content?.trim()) throw new AdminError(400, 'File SVG KanjiVG wajib diunggah.');
		return this.repository.previewTemplate(input);
	}
	save(id: string | null, value: unknown) {
		const input = parseKanaTemplateInput(value);
		if (!id && !input.svg_content?.trim())
			throw new AdminError(400, 'File SVG KanjiVG wajib diunggah.');
		return this.repository.saveTemplate(id, input);
	}
}
