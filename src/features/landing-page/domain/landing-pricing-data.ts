import type { CourseLevelItem } from '$features/course/domain/entities/course.entity';

export interface LevelCurriculumModule {
	number: string;
	title: string;
	duration: string;
	description: string;
	tags?: string[];
	kanjiPreview?: { kanji: string; note: string };
	formulaPreview?: { title: string; formula: string };
}

export interface LevelPricingDetail {
	id: string;
	code: string;
	name: string;
	description: string;
	price: number;
	points: string[];
	badge?: string;
	levelTag: string;
	standardTag: string;
	heroTitle: string;
	heroSubtitle: string;
	curriculumSubtitle: string;
	modules: LevelCurriculumModule[];
	prerequisites: string[];
	targetAudience: string[];
	faqs: Array<{ question: string; answer: string }>;
}

const LEVEL_METADATA_PRESETS: Record<string, Omit<LevelPricingDetail, 'id' | 'code' | 'name' | 'description' | 'price' | 'points'>> = {
	N5: {
		badge: 'Favorit Pemula',
		levelTag: 'Level N5 (Dasar)',
		standardTag: 'Kurikulum Standar JF 2025',
		heroTitle: 'Paket Belajar JLPT N5 Lengkap: Dari Nol Hingga Lulus Ujian',
		heroSubtitle:
			'Panduan komprehensif menguasai huruf Hiragana, Katakana, 100 Kanji pertama, 800 kosakata esensial, dan pola tata bahasa JLPT N5 dengan teknologi AI Sensei interaktif berstandar penutur asli Tokyo.',
		curriculumSubtitle: '6 Modul Utama • 84 Pelajaran Mandiri',
		modules: [
			{
				number: '01',
				title: 'Fondasi Aksara Jepang (Hiragana & Katakana)',
				duration: '12 Jam Belajar',
				description:
					'Kuasai 46 karakter dasar Hiragana & 46 Katakana beserta variasi Dakuon, Handakuon, Youon. Disertai video animasi urutan coretan (stroke order) dan rekaman audio artikulasi penutur asli Tokyo.',
				tags: ['Lembar Latihan Tulis Digital', '92 Audio Suara HD']
			},
			{
				number: '02',
				title: '100 Kanji Dasar JLPT N5 & Radikal',
				duration: '18 Jam Belajar',
				description:
					"Pemahaman mendalam 100 Kanji mutlak N5. Dilengkapi cara baca Kun'yomi & On'yomi, mnemonik visual bercerita agar mudah diingat, serta 200+ contoh kalimat penggunaan sehari-hari.",
				kanjiPreview: {
					kanji: '日 本 語 私 人',
					note: 'Termasuk 100 kartu interaktif radikal kanji'
				}
			},
			{
				number: '03',
				title: '800 Kosakata Esensial & SRS Flashcards',
				duration: 'Algoritma Adaptif',
				description:
					'Sistem hafalan tanpa lupa dengan teknologi Spaced Repetition System (SRS). Kosakata dikelompokkan ke dalam kategori tematik: keluarga, belanja, waktu, arah, makanan, dan aktivitas sekolah/kerja.',
				tags: ['Review Interval Harian', 'Evaluasi Pengucapan Mandiri']
			},
			{
				number: '04',
				title: '15 Bab Tata Bahasa & Partikel (Bunpou)',
				duration: '24 Jam Belajar',
				description:
					'Kupas tuntas partikel krusial yang sering mengecoh: は vs が, に vs で, を, へ, から, まで, と. Penjelasan bentuk lampau, konjugasi kata kerja bentuk -masu, bentuk -te, bentuk kamus, dan pola sopan desu/masu.',
				formulaPreview: {
					title: 'Contoh Pola Rumus:',
					formula: 'KB (Waktu) + に + KB (Tempat) + へ + KK (Pergi/Datang)'
				}
			},
			{
				number: '05',
				title: 'Choukai (Mendengar) & Dokkai (Membaca)',
				duration: '15 Sesi Audio',
				description:
					'Latihan audio percakapan realistis di stasiun, minimarket (konbini), dan kelas. Dilengkapi latihan membaca teks pendek, pengumuman publik, catatan harian, dan trik membedakan jebakan audio JLPT.'
			},
			{
				number: '06',
				title: '3x Simulasi Try Out Ujian JLPT N5 Lengkap',
				duration: 'Format Ujian Asli',
				description:
					'Simulasi persis format resmi The Japan Foundation dengan batas waktu otomatis (Timer), lembar jawaban digital, serta laporan diagnostik detail skor per seksi (Gengo Chishiki, Dokkai, Choukai).'
			}
		],
		prerequisites: [
			'Tanpa latar belakang bahasa Jepang: Dimulai dari cara memegang pensil dan melafalkan huruf A-I-U-E-O.',
			'Perangkat smartphone Android/iOS atau laptop dengan koneksi internet aktif.',
			'Komitmen belajar santai 15–20 menit setiap hari untuk hasil optimal.'
		],
		targetAudience: [
			'Pelajar & Mahasiswa yang merencanakan studi lanjut / program pertukaran ke Jepang.',
			'Pencari kerja untuk program Tokutei Ginou (SSW) atau Magang Kerja (Kenshusei).',
			'Pencinta budaya Jepang, anime, dan manga yang ingin paham percakapan tanpa subtitle.'
		],
		faqs: [
			{
				question: 'Apakah akses berlaku selamanya (lifetime)?',
				answer:
					'Ya! Sekali bayar, Anda berhak mengakses seluruh materi Paket N5 selamanya. Tidak ada biaya langganan bulanan, dan Anda otomatis menerima seluruh pembaruan materi ujian di masa depan tanpa biaya tambahan.'
			},
			{
				question: 'Bisakah platform ini diakses melalui smartphone?',
				answer:
					'Tentu saja. Gakkobit sepenuhnya responsif untuk smartphone (Android & iOS), tablet, dan laptop. Seluruh progress hafalan kosakata dan flashcard Anda tersinkronisasi otomatis antar-perangkat secara real-time.'
			},
			{
				question: 'Bagaimana jika saya sama sekali buta huruf Jepang?',
				answer:
					'Materi disusun spesifik untuk pemula absolut (level 0). Kami menyediakan latihan asosiasi gambar dan audio bertahap sehingga Anda bisa lancar membaca Hiragana dan Katakana hanya dalam 7–10 hari pertama.'
			},
			{
				question: 'Bagaimana cara klaim garansi 7 hari uang kembali?',
				answer:
					'Jika Anda merasa metode kami tidak cocok dalam 7 hari pertama sejak pembelian, cukup hubungi tim support kami melalui WhatsApp atau email. Dana akan kami kembalikan 100% tanpa pertanyaan berbelit-belit.'
			}
		]
	},
	N4: {
		badge: 'Pemula Lanjut',
		levelTag: 'Level N4 (Dasar Lanjut)',
		standardTag: 'Kurikulum Standar JF 2025',
		heroTitle: 'Paket Belajar JLPT N4: Percakapan Nyata & Pola Kalimat Majemuk',
		heroSubtitle:
			'Tingkatkan kemampuan dari pemula ke pengguna mandiri. Kuasai 300 Kanji, 1.500 kosakata, dan seluruh bentuk konjugasi penting (bentuk kamus, syarat, pengandaian, dan izin) untuk percakapan sehari-hari di Jepang.',
		curriculumSubtitle: '6 Modul Utama • 96 Pelajaran Mandiri',
		modules: [
			{
				number: '01',
				title: 'Review Kilat N5 & Pengantar Pola Majemuk',
				duration: '10 Jam Belajar',
				description:
					'Penyegaran konsep dasar dan transisi mulus ke struktur tata bahasa N4 yang lebih kompleks dan beragam.'
			},
			{
				number: '02',
				title: '300 Kanji Menengah Dasar & Radikal Terapan',
				duration: '22 Jam Belajar',
				description:
					'Penguasaan 200 Kanji tambahan N4 beserta kombinasi kata (jukugo) yang sering muncul pada bacaan umum.',
				kanjiPreview: {
					kanji: '会 社 電 車 駅',
					note: 'Termasuk mnemonik visual dan contoh konteks sosial'
				}
			},
			{
				number: '03',
				title: '1.500 Kosakata Tematik Kontekstual',
				duration: 'SRS Interaktif',
				description:
					'Kosa kata situasi kerja, navigasi transportasi, rumah sakit, percakapan kantor, dan transaksi komersial.',
				tags: ['SRS Adaptif', 'Audio Percakapan Alami']
			},
			{
				number: '04',
				title: 'Konjugasi Kata Kerja Tingkat Lanjut & Bentuk Sopan/Kasual',
				duration: '26 Jam Belajar',
				description:
					'Kuasai bentuk pengandaian (~tara, ~ba), bentuk keharusan, bentuk izin, bentuk pasif dasar, dan percakapan kasual (futsuukei).'
			},
			{
				number: '05',
				title: 'Choukai Situasi Sehari-hari & Cerita Pendek',
				duration: '18 Sesi Audio',
				description:
					'Mendengar pengumuman stasiun, instruksi atasan, dan dialog santai dengan penutur asli Tokyo.'
			},
			{
				number: '06',
				title: '5x Simulasi Ujian JLPT N4 Terstandar',
				duration: 'Format Ujian Asli',
				description:
					'Simulasi lengkap dengan timer, pembahasan soal interaktif, dan analisis kelemahan per materi.'
			}
		],
		prerequisites: [
			'Sudah menguasai huruf Hiragana & Katakana dengan lancar.',
			'Memahami tata bahasa dasar N5 (pola ~desu/~masu, partikel dasar).',
			'Komitmen belajar 20–30 menit setiap hari.'
		],
		targetAudience: [
			'Alumni atau lulusan JLPT N5 yang ingin melanjutkan ke jenjang percakapan fungsional.',
			'Calon pekerja SSW / Tokutei Ginou bidang Perhotelan, Food Service, atau Kaigo (Perawat).',
			'Pelajar yang bersiap kuliah atau kursus bahasa di sekolah Jepang (Nihongo Gakkou).'
		],
		faqs: [
			{
				question: 'Apakah paket ini mencakup materi pemula N5?',
				answer:
					'Paket N4 berfokus pada materi N4, namun Modul 1 menyediakan rangkuman cepat konsep inti N5 agar transisi pemahaman Anda sangat mulus.'
			},
			{
				question: 'Berapa lama waktu yang dibutuhkan untuk menyelesaikan N4?',
				answer:
					'Dengan komitmen belajar 20–30 menit setiap hari, siswa umumnya menyelesaikan seluruh modul dan lulus ujian dalam waktu 2–3 bulan.'
			},
			{
				question: 'Apakah ada latihan simulasi ujian resmi?',
				answer:
					'Ya, tersedia 5 set simulasi lengkap dengan audio Choukai dan kunci jawaban terperinci sesuai format resmi The Japan Foundation.'
			},
			{
				question: 'Apakah ada garansi uang kembali?',
				answer:
					'Ya, seluruh paket Gakkobit dilindungi garansi 7 hari uang kembali 100% tanpa syarat rumit jika Anda merasa materi kami tidak sesuai kebutuhan Anda.'
			}
		]
	},
	N3: {
		badge: 'Jembatan Menengah',
		levelTag: 'Level N3 (Menengah Mandiri)',
		standardTag: 'Kurikulum Standar JF 2025',
		heroTitle: 'Paket Belajar JLPT N3: Mandiri Berbahasa di Kehidupan & Kerja',
		heroSubtitle:
			'Tembus dinding pemisah antara dasar dan menengah. Kuasai 650 Kanji, 3.000 kosakata, nuansa bahasa halus, dan teks artikel nyata untuk hidup mandiri di Jepang.',
		curriculumSubtitle: '6 Modul Utama • 120 Pelajaran Mandiri',
		modules: [
			{
				number: '01',
				title: 'Pola Tata Bahasa Nuansa Halus (Kibou, Suisoku, Youdai)',
				duration: '20 Jam Belajar',
				description:
					'Pelajari perbedaan tipis antara ~you da, ~sou da, ~rashii, dan tata bahasa bernuansa ekspresi subjektif.'
			},
			{
				number: '02',
				title: '650 Kanji Menengah & Pembentukan Istilah',
				duration: '30 Jam Belajar',
				description:
					'Kuasai cara baca On-Kun ratusan kanji abstrak, istilah berita, dan kanji majemuk kompleks.'
			},
			{
				number: '03',
				title: '3.000 Kosakata Bahasa Kerja & Media',
				duration: 'SRS Interaktif',
				description:
					'Kosakata artikel koran, berita online, dialog di kantor, dan interaksi birokrasi pemerintahan Jepang.'
			},
			{
				number: '04',
				title: 'Keigo Dasar: Sonkeigo, Kenjougo, Teineigo',
				duration: '25 Jam Belajar',
				description:
					'Tata krama berbicara sopan dan hormat kepada atasan, klien kerja, dan tamu bisnis Jepang.'
			},
			{
				number: '05',
				title: 'Dokkai Artikel Panjang & Opini',
				duration: '20 Jam Belajar',
				description:
					'Strategi membaca cepat (skimming & scanning) artikel opini, esai pendek, dan pengumuman resmi.'
			},
			{
				number: '06',
				title: '5x Simulasi Ujian JLPT N3 Terstandar',
				duration: 'Format Ujian Asli',
				description:
					'Uji kesiapan dengan simulasi penuh, audio Choukai tempo penutur asli, dan analisis diagnostik kelulusan.'
			}
		],
		prerequisites: [
			'Sudah lulus atau menguasai materi JLPT N4.',
			'Dapat membaca kanji dasar dengan lancar tanpa bergantung pada Furigana.'
		],
		targetAudience: [
			'Pekerja profesional yang ingin bekerja di perusahaan Jepang di Indonesia atau Jepang.',
			'Mahasiswa yang menargetkan beasiswa MEXT atau pertukaran universitas.',
			'Pembelajar yang ingin fasih membaca novel ringan, manga asli, dan berita NHK Easy.'
		],
		faqs: [
			{
				question: 'Mengapa N3 sering disebut level tersulit bagi pemula?',
				answer:
					'Karena N3 adalah loncatan dari kalimat buatan ke bahasa Jepang nyata. Di Gakkobit, kami menjembatani loncatan ini dengan latihan kontekstual dan AI Sensei yang menjelaskan nuansa bahasa secara instan.'
			},
			{
				question: 'Apakah materi Keigo (bahasa sopan) dibahas tuntas?',
				answer:
					'Ya, modul khusus Keigo mencakup Sonkeigo (bahasa hormat), Kenjougo (bahasa rendah hati), dan Teineigo untuk situasi profesional.'
			},
			{
				question: 'Bagaimana cara mengakses simulasi ujian?',
				answer:
					'Simulasi ujian dapat diakses kapan saja melalui dashboard web tanpa batasan jumlah percobaan.'
			},
			{
				question: 'Apakah ada jaminan uang kembali?',
				answer:
					'Tentu saja, garansi 7 hari uang kembali 100% berlaku untuk seluruh paket Gakkobit.'
			}
		]
	},
	N2: {
		badge: 'Bisnis & Karir',
		levelTag: 'Level N2 (Menengah Atas)',
		standardTag: 'Kurikulum Standar JF 2025',
		heroTitle: 'Paket Belajar JLPT N2: Standar Emas Karir Profesional di Jepang',
		heroSubtitle:
			'Kunci utama bekerja di perusahaan multinasional Jepang. Kuasai 1.000 Kanji, 6.000 kosakata, bacaan surat kabar, dan etika bisnis tingkat mahir.',
		curriculumSubtitle: '6 Modul Utama • 140 Pelajaran Mandiri',
		modules: [
			{
				number: '01',
				title: 'Tata Bahasa Bisnis & Tulisan Formal (Kakikotoba)',
				duration: '30 Jam Belajar',
				description:
					'Ekspresi formal tingkat tinggi yang dipakai dalam email bisnis, kontrak kerja, dan proposal.'
			},
			{
				number: '02',
				title: '1.000 Kanji Lanjutan & Kosa Kata Majemuk Canggih',
				duration: '40 Jam Belajar',
				description:
					'Penguasaan kanji editorial surat kabar, artikel sosial-ekonomi, dan dokumen resmi kenegaraan.'
			},
			{
				number: '03',
				title: '6.000 Kosakata SRS & Idiom Jepang (Kanyouku)',
				duration: 'SRS Interaktif',
				description:
					'Kosakata abstrak, peribahasa, dan ungkapan kiasan yang diuji di bagian kosakata N2.'
			},
			{
				number: '04',
				title: 'Dokkai Intensif Berita, Kolom Editorial, & Kritik',
				duration: '35 Jam Belajar',
				description:
					'Teknik menganalisis argumen penulis, membedakan fakta vs opini, dan membaca 1.000 kata dalam 10 menit.'
			},
			{
				number: '05',
				title: 'Choukai Diskusi Cepat, Siaran Berita, & Rapat',
				duration: '25 Sesi Audio',
				description:
					'Melatih telinga untuk menangkap poin kesimpulan dari percakapan berbelit-belit dan rapat formal.'
			},
			{
				number: '06',
				title: '5x Simulasi Ujian JLPT N2 Penuh',
				duration: 'Format Ujian Asli',
				description:
					'Simulasi komprehensif dengan batas waktu ketat dan kalkulasi passing score resmi.'
			}
		],
		prerequisites: [
			'Memiliki penguasaan materi setara JLPT N3.',
			'Mampu memahami percakapan umum bahasa Jepang tanpa hambatan besar.'
		],
		targetAudience: [
			'Pencari kerja visa Engineering / Specialist in Humanities / International Services di Jepang.',
			'Calon mahasiswa S1/S2 di universitas riset terkemuka di Jepang.',
			'Penerjemah dan interpreter profesional.'
		],
		faqs: [
			{
				question: 'Apakah sertifikat N2 diakui untuk visa kerja di Jepang?',
				answer:
					'Ya, JLPT N2 adalah syarat standar hampir semua perusahaan Jepang untuk posisi profesional kantor dan memberikan poin tambahan pada visa tenaga kerja terampil.'
			},
			{
				question: 'Apakah teks bacaan Dokkai diambil dari materi nyata?',
				answer:
					'Ya, latihan bacaan diambil dan diadaptasi dari koran Jepang, esai filsafat, sains populer, dan buku sosiologi kontemporer.'
			},
			{
				question: 'Berapa lama akses berlaku?',
				answer:
					'Akses berlaku selamanya tanpa batas waktu (lifetime access).'
			},
			{
				question: 'Apakah ada garansi kepuasan?',
				answer:
					'Garansi 7 hari uang kembali 100% berlaku penuh jika Anda tidak puas dengan kualitas materi kami.'
			}
		]
	},
	N1: {
		badge: 'Tingkat Mahir',
		levelTag: 'Level N1 (Penutur Mahir)',
		standardTag: 'Kurikulum Standar JF 2025',
		heroTitle: 'Paket Belajar JLPT N1: Puncak Kemahiran Berbahasa Jepang',
		heroSubtitle:
			'Tingkat tertinggi kemahiran bahasa Jepang. Kuasai 2.000+ Kanji, 10.000 kosakata, dokumen akademis, perdebatan mendalam, dan sastra klasik-modern.',
		curriculumSubtitle: '6 Modul Utama • 160 Pelajaran Mandiri',
		modules: [
			{
				number: '01',
				title: 'Tata Bahasa Abstrak, Arkais, & Nuansa Filosofis',
				duration: '35 Jam Belajar',
				description:
					'Pola tata bahasa langka yang digunakan dalam esai akademis, hukum, dan sastra modern.'
			},
			{
				number: '02',
				title: '2.000+ Kanji Joyo Lengkap & Yojijukugo',
				duration: '50 Jam Belajar',
				description:
					'Kuasai idiom 4 karakter (yojijukugo), peribahasa kuno, dan kanji tingkat universitas.'
			},
			{
				number: '03',
				title: '10.000 Kosakata Tingkat Tinggi & Nuansa Konseptual',
				duration: 'SRS Interaktif',
				description:
					'Perbendaharaan kata bidang hukum, kedokteran dasar, ekonomi moneter, dan filsafat ilmu.'
			},
			{
				number: '04',
				title: 'Dokkai Esai Filsafat, Sastra, & Analisis Kritis',
				duration: '40 Jam Belajar',
				description:
					'Membedah struktur logika penulis Jepang dalam teks padat dan kontradiksi argumen.'
			},
			{
				number: '05',
				title: 'Choukai Debat Panel, Ceramah Ilmiah, & Wawancara Mendalam',
				duration: '30 Sesi Audio',
				description:
					'Menangkap implikasi tersirat, intonasi ironi, dan kesimpulan dari percakapan rumit berkecepatan tinggi.'
			},
			{
				number: '06',
				title: '5x Simulasi Ujian JLPT N1 Lengkap',
				duration: 'Format Ujian Asli',
				description:
					'Simulasi paling menantang dengan standar kelulusan internasional.'
			}
		],
		prerequisites: [
			'Sudah menguasai materi JLPT N2 dengan pemahaman kuat.',
			'Terbiasa membaca artikel berbahasa Jepang setiap hari.'
		],
		targetAudience: [
			'Dosen, peneliti, dan akademisi studi Jepang.',
			'Eksekutif bisnis dan konsultan di perusahaan multinasional Jepang.',
			'Penerjemah sastra, hukum, dan interpreter simultan.'
		],
		faqs: [
			{
				question: 'Berapa passing score untuk lulus JLPT N1?',
				answer:
					'Passing score resmi N1 adalah 100 dari total 180 poin, dengan syarat nilai minimum 19 poin di setiap seksi (Gengo Chishiki, Dokkai, Choukai).'
			},
			{
				question: 'Apakah AI Sensei dapat mendiskusikan kanji abstrak?',
				answer:
					'Ya, AI Sensei kami dilatih dengan referensi kamus monolingual Jepang (Koujien & Daijirin) untuk menjelaskan etimologi dan nuansa mendalam.'
			},
			{
				question: 'Berapa lama masa aktif paket ini?',
				answer:
					'Akses seumur hidup (lifetime) tanpa ada biaya tambahan perpanjangan.'
			},
			{
				question: 'Bagaimana garansi uang kembali bekerja?',
				answer:
					'Hubungi kami dalam waktu 7 hari sejak pembelian untuk pengembalian 100% tanpa ribet.'
			}
		]
	}
};

export function resolveLevelPricingDetail(code: string, levels: CourseLevelItem[]): LevelPricingDetail {
	const normalizedCode = code.toUpperCase().trim();
	const levelItem = levels.find((l) => l.code.toUpperCase() === normalizedCode);

	const preset = LEVEL_METADATA_PRESETS[normalizedCode] ?? {
		badge: 'Paket Belajar',
		levelTag: `Level ${normalizedCode}`,
		standardTag: 'Kurikulum Standar JF 2025',
		heroTitle: `Paket Belajar JLPT ${normalizedCode}: Jalur Mandiri & Terstruktur`,
		heroSubtitle: `Pelajari kurikulum komprehensif level ${normalizedCode} dengan panduan modul interaktif, latihan soal resmi, dan dukungan AI Sensei 24/7.`,
		curriculumSubtitle: 'Modul Pembelajaran Mandiri Terstruktur',
		modules: [
			{
				number: '01',
				title: `Fondasi & Pemahaman Materi ${normalizedCode}`,
				duration: '15 Jam Belajar',
				description: `Materi esensial yang mencakup pola tata bahasa, kosakata, dan pemahaman dasar level ${normalizedCode}.`
			},
			{
				number: '02',
				title: 'Latihan Soal & Pembahasan Mandiri',
				duration: 'Latihan Interaktif',
				description: 'Kumpulan soal latihan beserta penjelasan lengkap untuk memperdalam pemahaman.'
			},
			{
				number: '03',
				title: 'Simulasi Ujian Terstandar',
				duration: 'Format Ujian Asli',
				description: 'Simulasi ujian dengan penghitungan skor dan evaluasi hasil belajar.'
			}
		],
		prerequisites: [
			'Perangkat smartphone atau laptop dengan koneksi internet aktif.',
			'Komitmen belajar teratur untuk mencapai target kelulusan.'
		],
		targetAudience: [
			`Siapapun yang ingin menguasai dan menembus ujian kemampuan bahasa Jepang level ${normalizedCode}.`
		],
		faqs: [
			{
				question: 'Apakah akses berlaku selamanya?',
				answer: 'Ya, sekali bayar untuk akses selamanya tanpa biaya langganan bulanan.'
			},
			{
				question: 'Apakah ada garansi?',
				answer: 'Tersedia garansi 7 hari uang kembali 100% jika materi tidak sesuai kebutuhan Anda.'
			}
		]
	};

	// Use points from database if available and non-empty, otherwise use preset points
	const dbPoints = (levelItem?.points ?? []).filter((p) => p && p.trim().length > 0);
	const points = dbPoints.length > 0
		? dbPoints
		: [
				`Akses penuh modul pembelajaran JLPT ${normalizedCode} komprehensif`,
				'AI Sensei Tutor 24/7 tanpa batas tanya jawab',
				'Flashcard SRS otomatis tersinkronisasi',
				`Simulasi Try Out ujian JLPT ${normalizedCode} terstandar`,
				'Sertifikat Kelulusan Resmi Gakkobit terverifikasi',
				'Garansi update materi dan simulasi ujian'
			];

	return {
		id: levelItem?.id ?? normalizedCode.toLowerCase(),
		code: normalizedCode,
		name: levelItem?.name || `JLPT ${normalizedCode}`,
		description: levelItem?.description || preset.heroSubtitle,
		price: levelItem?.price ?? 0,
		points,
		badge: preset.badge,
		levelTag: preset.levelTag,
		standardTag: preset.standardTag,
		heroTitle: preset.heroTitle,
		heroSubtitle: preset.heroSubtitle,
		curriculumSubtitle: preset.curriculumSubtitle,
		modules: preset.modules,
		prerequisites: preset.prerequisites,
		targetAudience: preset.targetAudience,
		faqs: preset.faqs
	};
}
