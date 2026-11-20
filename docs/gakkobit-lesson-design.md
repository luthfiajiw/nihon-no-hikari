# Design System & HTML Style Guide (`design.md`)

Dokumen ini berisi standar visual, token warna, tipografi, aturan semantik elemen, responsivitas, dan blok komponen dasar HTML untuk penyusunan materi pembelajaran. Gaya desain ini menggunakan pendekatan **Warm Editorial Minimalism** dengan _inline CSS_ penuh agar mudah dipindahkan ke berbagai platform (LMS, CMS, atau _rich-text editor_) dan aman terhadap _HTML sanitizer_ (seperti DOMPurify) tanpa bergantung pada _stylesheet_ eksternal maupun `<style>` tag.

---

## 1. Prinsip Desain & Aturan Utama

- **Inline-Style Portability:** Seluruh gaya ditulis langsung pada atribut `style="..."` di setiap elemen HTML[cite: 1].
- **Zero-Margin Headings:** Seluruh elemen heading (`<h2>`, `<h3>`, `<h4>`) **wajib** memiliki deklarasi `margin: 0` (atau `margin: 0 0 [bottom] 0` jika membutuhkan jarak bawah)[cite: 1]. Jangan pernah mengandalkan _default margin_ dari browser, dan gunakan `padding` yang simetris/penuh pada kontainer pembungkusnya.
- **Semantic `<p>` for Sentences, Card Japanese Words & Example Headers vs. `<span>` for Labels/Badges:**
  - **Kalimat Utuh (`<p>`):** Seluruh kalimat penjelasan, pengantar materi, maupun kalimat catatan pengecualian/aturan **wajib menggunakan elemen `<p>`**[cite: 1].
  - **Kata Hiragana, Kanji & Katakana di Dalam Kartu (`<p>`):** Setiap kata atau kosakata bahasa Jepang (Hiragana, Kanji, maupun Katakana — seperti `にまんごせん` pada kartu kosakata, serta arti & teks target `17 Agustus` / `8月17日` pada header contoh penerapan) **wajib menggunakan elemen `<p>`** (dengan `<ruby>` dan `<rt>` di dalamnya bila memiliki furigana). Pada sub-kartu pecahan rumus, bungkus `<strong>` dengan `<p style="margin:0">`. Selalu sertakan deklarasi `margin` secara eksplisit (misalnya `margin: 0 0 0.35rem 0`, `margin: 0 0 0.5rem 0`, atau `margin:0`) agar _default margin_ `<p>` dari browser tidak merusak tata letak kartu.
  - **Label, Romaji, Badge & Operator (`<span>` / `<strong>` / `<div>`):** **Dilarang menggunakan elemen `<p>`** untuk label kartu, arti/angka singkat kartu kosakata, teks romaji, _badge_/_pill_ cara baca, simbol operator (`+`, `=`), maupun label atas dan bacaan/arti bawah pada sub-kartu pecahan rumus. Gunakan kombinasi `<span>`, `<div>`, dan `<strong>` sesuai contoh struktur komponen.
- **No Tables for Theory/Examples:** **Dilarang menggunakan elemen `<table>`** untuk menampilkan kosakata, daftar aturan, atau contoh penerapan teori. Semua contoh penerapan dan rincian struktur harus disajikan menggunakan komponen berbasis kartu (_Card Grid_ atau _Theory Application Card_) agar tetap rapi dan responsif di layar ponsel.
- **Max 2-Column Card Layout:** Tata letak grid untuk kartu kosakata maupun contoh penerapan dibatasi **maksimal 2 kolom** pada layar desktop/tablet (`flex: 1 1 45%; min-width: 200px`), yang otomatis turun menjadi **1 kolom** pada layar mobile.
- **High-Contrast Framing & Layered Warm Surfaces:** Setiap bagian utama (`<section>`) dibatasi garis tepi gelap (`#0c0a09`) di atas latar putih bersih (`#FFF`), dengan hierarki konten yang dibentuk melalui gradasi permukaan hangat (`#FFF` → `#FAF8F6` → `#F5F3F2` → `#EFEBE8` → `#72655E`) tanpa menggunakan _box-shadow_[cite: 1].

---

## 2. Palet Warna (Color Tokens)

### A. Latar Belakang (Surfaces)

| Peran                       | Hex Code  | Penggunaan                                                                        |
| :-------------------------- | :-------- | :-------------------------------------------------------------------------------- |
| **Primary Surface**         | `#FFF`    | Kontainer bagian utama (`<section>`)[cite: 1].                                    |
| **Soft Canvas Surface**     | `#FAF8F6` | Kontainer contoh penyusunan/penerapan dan sub-kartu pecahan rumus.                |
| **Secondary Surface**       | `#F5F3F2` | Kartu kosakata, kotak rumus utama, dan sub-kartu materi[cite: 1].                 |
| **Highlight Surface**       | `#EFEBE8` | Kotak sorotan (_callout_), pembungkus rumus pecahan, dan _badge_/_pill_[cite: 1]. |
| **Inverted Result Surface** | `#72655E` | Kartu hasil akhir (_output_) pada komponen simulasi penyusunan rumus.             |

### B. Garis Tepi (Borders)

| Peran                | Hex Code  | Spesifikasi | Penggunaan                                                               |
| :------------------- | :-------- | :---------- | :----------------------------------------------------------------------- |
| **Primary Border**   | `#0c0a09` | `1px solid` | Bingkai luar `<section>`[cite: 1].                                       |
| **Secondary Border** | `#E5DFDA` | `1px solid` | Bingkai kartu kosakata dan kotak rumus (`#F5F3F2`)[cite: 1].             |
| **Soft Card Border** | `#E3DCD7` | `1px solid` | Bingkai kartu pecahan rumus di atas permukaan `#FAF8F6`.                 |
| **Highlight Border** | `#D4C9C2` | `1px solid` | Bingkai kotak sorotan dan pembungkus rumus pecahan (`#EFEBE8`)[cite: 1]. |
| **Inverted Border**  | `#615752` | `1px solid` | Bingkai kartu hasil akhir (`#72655E`).                                   |

### C. Teks & Aksen (Typography & Accents)

| Peran               | Hex Code                          | Penggunaan                                                                                                                    |
| :------------------ | :-------------------------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| **Heading Primary** | `#332D29`                         | Judul bagian (`<h2>`, `<h3>`, `<h4>`), teks Hiragana/Kanji/Katakana utama pada kartu (`<p>`), dan judul rumus[cite: 1].       |
| **Strong Emphasis** | `#2B2521`                         | Arti utama pada kartu, rumus inti, kata kunci tebal (`<strong>`), dan Kanji contoh[cite: 1].                                  |
| **Body Primary**    | `#554D47`                         | Teks kalimat/paragraf penjelasan utama (`<p>`)[cite: 1].                                                                      |
| **Body Secondary**  | `#615752`                         | Teks romaji (_italic_), label kartu pecahan, simbol operator (`+`, `=`), dan kalimat di dalam kotak sorotan (`<p>`)[cite: 1]. |
| **Brand Accent**    | `#8F7365`                         | Furigana (`<rt>`), judul/arti pada header contoh penerapan, teks _badge_ cara baca (`#EFEBE8`), kalimat catatan pengecualian rumus, dan sorotan istilah penting[cite: 1]. |
| **Inverted Texts**  | `#FAF8F6` / `#EFEBE8` / `#D4C9C2` | Teks Kanji hasil (`#FAF8F6`), label atas (`#EFEBE8`), dan terjemahan bawah (`#D4C9C2`) di dalam kartu `#72655E`.              |

---

## 3. Tipografi, Aturan Semantik & Responsivitas

### A. Skala Tipografi & Pemetaan Elemen

- **Aturan Wajib Heading:** Semua elemen `<h2>`, `<h3>`, dan `<h4>` wajib menyertakan `margin: 0` (atau `margin: 0 0 0.5rem 0` bila memerlukan jarak dengan elemen di bawahnya)[cite: 1].
- **Judul Bagian (`<h2>`):** `color: #332D29; font-size: 22px; font-weight: 700; line-height: 1.3; margin: 0`[cite: 1]
- **Judul Sub-Kartu / Rumus (`<h3>`):** `color: #332D29; font-size: 18px; font-weight: 700; line-height: 1.4; margin: 0 0 0.6rem 0`[cite: 1]
- **Judul Kotak Sorotan (`<h4>`):** `color: #332D29; font-size: 16px; font-weight: 700; line-height: 1.4; margin: 0 0 0.5rem 0`[cite: 1]
- **Kalimat Penjelasan Utama (`<p>`):** `color: #554D47; font-size: 16px; line-height: 1.6; margin: 1rem 0`[cite: 1]
- **Kalimat Catatan / Pengecualian Rumus (`<p>`):** `color: #8F7365; font-size: 14px; line-height: 1.4; margin: 0`[cite: 1]
- **Kata Hiragana / Kanji / Katakana pada Kartu Kosakata (`<p>`, opsional dengan `<ruby>`):** `color: #332D29; font-size: 32px; font-weight: 700; line-height: 1.4; margin: 0 0 0.35rem 0` (**Wajib** menggunakan `<p>`, bukan `<div>`)
- **Arti / Judul Header Contoh Penerapan (`<p>`):** `color: #8F7365; font-size: 20px; font-weight: 700; letter-spacing: 0.04em; margin: 0 0 0.5rem 0; line-height: 1.2`
- **Teks Target pada Header Contoh Penerapan (`<p>`):** `color: #2B2521; font-size: 32px; font-weight: 700; letter-spacing: 0.04em; margin: 0 0 0.5rem 0; line-height: 1.2`
- **Badge Cara Baca Contoh Penerapan (`<span>`):** `display: inline-block; background-color: #EFEBE8; color: #8F7365; font-size: 15px; font-weight: 600; padding: 6px 20px; border-radius: 999px`
- **Kata pada Pecahan Rumus (`<p style="margin:0"><strong>`):** `display: block; color: #2B2521; font-size: 20px; margin-bottom: 2px` (atau `#FAF8F6` pada kartu hasil akhir `#72655E`), diapit oleh label atas dan keterangan bawah menggunakan `<span>` (`font-size: 12px`)
- **Teks Furigana (`<rt>`):** `color: #8F7365; font-size: 16px; font-weight: 600`

### B. Teknik Responsivitas Tanpa Media Query

Karena _inline CSS_ tidak mendukung `@media`, gunakan dua pola Flexbox berikut agar tampilan otomatis beradaptasi di layar mobile:

1. **Grid Kartu Maksimal 2 Kolom (Kosakata):**
   - **Kontainer:** `display: flex; flex-wrap: wrap; gap: 1rem`
   - **Item Kartu:** `box-sizing: border-box; flex: 1 1 45%; min-width: 200px`
   - _Cara Kerja:_ Pada layar desktop/tablet, `45%` memastikan maksimal hanya 2 kartu yang muat dalam satu baris. Saat lebar layar menyempit di bawah ~440px (mobile), `min-width: 200px` memaksa kartu turun menjadi 1 kolom penuh secara rapi.

2. **Pecahan Rumus Horizontal-ke-Vertikal (_Fab Four Calc Technique_):**
   - **Kontainer:** `display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap`
   - **Item Kartu Pecahan:** `flex: 1 1 calc((450px - 100%) * 999); min-width: 0; box-sizing: border-box`
   - **Simbol Operator (`+` / `=`):** `text-align: center; color: #615752; font-size: 20px; font-weight: 700; line-height: 1.2; padding: 2px 4px`
   - _Cara Kerja:_ Saat lebar kontainer di atas `450px` (desktop), nilai `calc` menjadi negatif sehingga seluruh elemen berjejer horizontal dalam 1 baris. Saat lebar kontainer di bawah `450px` (mobile), nilai `calc` menjadi sangat besar sehingga setiap kartu pecahan melebar penuh (`100%`) dan simbol operator otomatis bertumpuk di barisnya masing-masing secara terpusat.

---

## 4. Blok Komponen Standar (Base Components)

### A. Kontainer Bagian (`<section>`)

Wadah utama untuk setiap sub-bab materi[cite: 1]. Gunakan `<p>` untuk seluruh kalimat pengantar atau penjelasan teori[cite: 1].

```html
<section
	style="background-color: #FFF; border: 1px solid #0c0a09; border-radius: 12px; padding: 1.75rem; margin-bottom: 24px"
>
	<h2 style="color: #332D29; font-size: 22px; font-weight: 700; line-height: 1.3; margin: 0">
		Judul Bagian Materi
	</h2>

	<p style="color: #554D47; font-size: 16px; line-height: 1.6; margin: 1rem 0">
		Kalimat penjelasan teori menggunakan elemen paragraf dengan penekanan pada
		<strong style="color: #2B2521"
			>rumus utama (<span style="color: #8F7365">cara baca</span>)</strong
		>
		serta <strong style="color: #8F7365">poin pengecualian</strong> yang wajib diingat.
	</p>
</section>
```

### B. Kartu Kosakata

Setiap kata Hiragana, Kanji, maupun Katakana di dalam kartu **wajib menggunakan elemen `<p>`** (dengan `margin` eksplisit agar _default margin_ tidak memengaruhi tata letak). Bila menggunakan Kanji berfurigana, tempatkan `<ruby>` dan `<rt>` di dalam `<p>`. Elemen lain seperti angka/arti, _badge_/_pill_, dan romaji tetap menggunakan `<strong>` atau `<span>`.

```html
<div
	style="background-color: #F5F3F2; border: 1px solid #E5DFDA; border-radius: 10px; padding: 1.25rem; box-sizing: border-box; flex: 1 1 45%; min-width: 200px"
>
	<div
		style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem"
	>
		<strong style="color: #2B2521; font-size: 18px">25.000</strong>
		<span
			style="background-color: #EFEBE8; color: #615752; font-size: 14px; font-weight: 600; padding: 4px 10px; border-radius: 999px"
			>2 | 5000</span
		>
	</div>

	<p
		style="color: #332D29; font-size: 32px; font-weight: 700; line-height: 1.4; margin: 0 0 0.35rem 0"
	>
		にまんごせん
	</p>

	<span style="display: block; color: #615752; font-size: 16px; font-style: italic">
		niman gosen
	</span>
</div>
```

### C. Contoh Penerapan (Simulasi Penyusunan Rumus)

Komponen ini ditempatkan di dalam `<section>` untuk memvisualisasikan cara menggabungkan unsur kata/pola menjadi bentuk akhir. Kontainer luar menggunakan permukaan hangat `#FAF8F6` berisi blok header contoh (arti, kata/frasa target, dan _pill_ cara baca) serta kotak pecahan rumus `#EFEBE8` dengan sub-kartu `#FAF8F6`, simbol operator (`+`, `=`), dan kartu hasil akhir `#72655E`.

```html
<div
	style="background-color: #FAF8F6; padding: 1.5rem 1.5rem; border-radius: 12px; text-align: center; margin-bottom: 1rem"
>
	<div style="margin-bottom: 1.75rem">
		<p
			style="color: #8F7365; font-size: 20px; font-weight: 700; letter-spacing: 0.04em; margin: 0 0 0.5rem 0; line-height: 1.2"
		>
			17 Agustus
		</p>
		<p
			style="color: #2B2521; font-size: 32px; font-weight: 700; letter-spacing: 0.04em; margin: 0 0 0.5rem 0; line-height: 1.2"
		>
			8月17日
		</p>
		<span
			style="display: inline-block; background-color: #EFEBE8; color: #8F7365; font-size: 15px; font-weight: 600; padding: 6px 20px; border-radius: 999px"
		>
			はちがつ じゅうしちにち
		</span>
	</div>

	<div
		style="background-color: #EFEBE8; border: 1px solid #D4C9C2; border-radius: 12px; padding: 1.125rem 1.25rem; display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap"
	>
		<div
			style="flex: 1 1 calc((450px - 100%) * 999); min-width: 0; box-sizing: border-box; background-color: #FAF8F6; border: 1px solid #E3DCD7; border-radius: 10px; padding: 0.875rem 0.75rem; text-align: center"
		>
			<span style="display: block; color: #615752; font-size: 12px; margin-bottom: 4px">
				Bulan 8 (Agustus)
			</span>
			<p style="margin:0">
				<strong style="display: block; color: #2B2521; font-size: 20px; margin-bottom: 2px">
					8月
				</strong>
			</p>
			<span style="display: block; color: #8F7365; font-size: 12px">
				はちがつ
			</span>
		</div>

		<span
			style="text-align: center; color: #615752; font-size: 20px; font-weight: 700; line-height: 1.2; padding: 2px 4px"
		>
			+
		</span>

		<div
			style="flex: 1 1 calc((450px - 100%) * 999); min-width: 0; box-sizing: border-box; background-color: #FAF8F6; border: 1px solid #E3DCD7; border-radius: 10px; padding: 0.875rem 0.75rem; text-align: center"
		>
			<span style="display: block; color: #615752; font-size: 12px; margin-bottom: 4px">
				Tanggal 17
			</span>
			<p style="margin:0">
				<strong style="display: block; color: #2B2521; font-size: 20px; margin-bottom: 2px">
					17日
				</strong>
			</p>
			<span style="display: block; color: #8F7365; font-size: 12px">
				じゅうしちにち
			</span>
		</div>

		<span
			style="text-align: center; color: #615752; font-size: 20px; font-weight: 700; line-height: 1.2; padding: 2px 4px"
		>
			=
		</span>

		<div
			style="flex: 1 1 calc((450px - 100%) * 999); min-width: 0; box-sizing: border-box; background-color: #72655E; border: 1px solid #615752; border-radius: 10px; padding: 0.875rem 0.75rem; text-align: center"
		>
			<span style="display: block; color: #EFEBE8; font-size: 12px; margin-bottom: 4px">
				Hasil
			</span>
			<p style="margin:0">
				<strong style="display: block; color: #FAF8F6; font-size: 20px; margin-bottom: 2px">
					8月17日
				</strong>
			</p>
			<span style="display: block; color: #D4C9C2; font-size: 12px">
				17 Agustus
			</span>
		</div>
	</div>
</div>
```
