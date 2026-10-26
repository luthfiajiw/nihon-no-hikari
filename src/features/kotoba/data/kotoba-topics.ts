export const kotobaLevels = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;
export type KotobaLevel = (typeof kotobaLevels)[number];
export type KotobaCategory = 'Dasar' | 'Populer' | 'Pemula';

export interface KotobaTopic {
	id: string;
	level: KotobaLevel;
	title: string;
	description: string;
	category: KotobaCategory;
	vocabularyCount: number;
	exerciseCount: number;
	createdAt: number;
	coverUrl?: string;
	mediaExpiresAt?: string;
}

// Example topics until a dedicated Kotoba API is available.
export const exampleKotobaTopics: KotobaTopic[] = [
	{
		id: 'sekolah',
		level: 'N5',
		title: 'Sekolah',
		description: 'Kosakata seputar lingkungan sekolah dan kegiatan belajar.',
		category: 'Dasar',
		vocabularyCount: 42,
		exerciseCount: 12,
		createdAt: 8
	},
	{
		id: 'keluarga',
		level: 'N5',
		title: 'Keluarga',
		description: 'Kosakata tentang anggota keluarga dan hubungan keluarga.',
		category: 'Populer',
		vocabularyCount: 28,
		exerciseCount: 10,
		createdAt: 7
	},
	{
		id: 'makanan-minuman',
		level: 'N5',
		title: 'Makanan & Minuman',
		description: 'Kosakata makanan, minuman, dan kegiatan makan sehari-hari.',
		category: 'Pemula',
		vocabularyCount: 36,
		exerciseCount: 14,
		createdAt: 6
	},
	{
		id: 'angka-waktu',
		level: 'N5',
		title: 'Angka & Waktu',
		description: 'Kosakata angka, waktu, tanggal, dan hari dalam bahasa Jepang.',
		category: 'Dasar',
		vocabularyCount: 31,
		exerciseCount: 11,
		createdAt: 5
	},
	{
		id: 'transportasi',
		level: 'N5',
		title: 'Transportasi',
		description: 'Kosakata alat transportasi dan aktivitas bepergian.',
		category: 'Populer',
		vocabularyCount: 24,
		exerciseCount: 8,
		createdAt: 4
	},
	{
		id: 'rumah',
		level: 'N5',
		title: 'Rumah',
		description: 'Kosakata bagian rumah, ruangan, dan peralatan di rumah.',
		category: 'Dasar',
		vocabularyCount: 27,
		exerciseCount: 9,
		createdAt: 3
	},
	{
		id: 'pekerjaan',
		level: 'N5',
		title: 'Pekerjaan',
		description: 'Kosakata nama pekerjaan dan aktivitas di tempat kerja.',
		category: 'Pemula',
		vocabularyCount: 18,
		exerciseCount: 6,
		createdAt: 2
	},
	{
		id: 'tubuh',
		level: 'N5',
		title: 'Tubuh',
		description: 'Kosakata bagian tubuh manusia dan kesehatan dasar.',
		category: 'Dasar',
		vocabularyCount: 22,
		exerciseCount: 7,
		createdAt: 1
	}
];
