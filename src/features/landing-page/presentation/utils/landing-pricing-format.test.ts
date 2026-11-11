import { describe, expect, it } from 'vitest';
import { formatRupiah } from './landing-pricing-format';

describe('formatRupiah', () => {
	it('formats 0 as Gratis', () => {
		expect(formatRupiah(0)).toBe('Gratis');
	});

	it('formats positive amount in Indonesian Rupiah format', () => {
		const formatted = formatRupiah(49000);
		expect(formatted).toContain('Rp');
		expect(formatted).toContain('49.000');
	});

	it('formats large numbers correctly', () => {
		const formatted = formatRupiah(1250000);
		expect(formatted).toContain('1.250.000');
	});
});
