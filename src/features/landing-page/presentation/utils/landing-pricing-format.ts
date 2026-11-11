export function formatRupiah(value: number): string {
	if (value === 0) return 'Gratis';
	return 'Rp ' + new Intl.NumberFormat('id-ID').format(value);
}
