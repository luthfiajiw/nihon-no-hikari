import { z } from 'zod';
export function integer(label: string, max: number, min = 0) {
	return z
		.number({ error: `${label} harus berupa angka.` })
		.int(`${label} harus berupa bilangan bulat.`)
		.min(min, `${label} minimal ${min}.`)
		.max(max, `${label} maksimal ${max}.`);
}

export const title = z
	.string({ error: 'Judul wajib diisi.' })
	.refine((value) => value.trim().length > 0, 'Judul wajib diisi.')
	.refine((value) => new TextEncoder().encode(value).length <= 160, 'Judul maksimal 160 byte.');
export const slug = z
	.string({ error: 'Slug wajib diisi.' })
	.max(120, 'Slug maksimal 120 karakter.')
	.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug harus berupa huruf kecil, angka, dan tanda hubung.');
export const mediaUrl = z
	.string({ error: 'URL media tidak valid.' })
	.refine((value) => {
		if (value === '') return true;
		try {
			const url = new URL(value);
			return ['http:', 'https:'].includes(url.protocol) && Boolean(url.hostname);
		} catch {
			return false;
		}
	}, 'URL media harus menggunakan HTTP atau HTTPS.')
	.nullable()
	.optional();
