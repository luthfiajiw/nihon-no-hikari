export function formatDuration(totalMinutes: number): string {
	if (totalMinutes < 60) return `${totalMinutes} menit`;

	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;
	return minutes > 0 ? `${hours} jam ${minutes} menit` : `${hours} jam`;
}

export function getModuleStatusLabel(status: string): string {
	switch (status) {
		case 'completed':
			return 'Selesai';
		case 'in_progress':
			return 'Sedang dipelajari';
		case 'locked':
			return 'Terkunci';
		default:
			return 'Belum dimulai';
	}
}
