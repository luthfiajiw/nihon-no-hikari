<script lang="ts">
	import { GraduationCap, Languages } from 'lucide-svelte';
	import logoFull from '$lib/assets/images/gakkobit-full-logo.png';
	import { viewportReveal } from '$lib/actions/viewport-reveal';

	let {
		scrollTo
	}: {
		scrollTo: (id: string, e?: MouseEvent) => void;
	} = $props();
</script>

<!-- FOOTER -->
<footer class="mt-space-xl w-full border-t border-outline-variant/40 bg-surface-container-low">
	<div class="mx-auto max-w-7xl px-gutter py-space-xl">
		<div class="mb-space-xl grid grid-cols-1 gap-space-lg md:grid-cols-2 lg:grid-cols-5" use:viewportReveal={{ direction: 'up', delay: 100 }}>
			<div class="pr-0 lg:col-span-2 lg:pr-space-xl">
				<div class="mb-space-md flex items-center gap-space-sm">
					<img
						alt="Ganbare Gakkobit Logo"
						class="h-8 w-auto object-contain"
						src={logoFull}
					/>
				</div>
				<p class="mb-space-md font-body-md text-body-md leading-relaxed text-on-surface-variant">
					Platform belajar Bahasa Jepang interaktif dengan sistem repetisi berspasi (SRS), bimbingan AI kurikulum adaptif, dan jalur kelulusan terstruktur JLPT N5 hingga N1.
				</p>
				<div class="flex items-center gap-space-sm text-on-surface-variant">
					<span class="inline-flex size-8 items-center justify-center rounded-full border border-outline-variant/40 bg-surface-container text-on-surface-variant">
						<GraduationCap class="size-4" />
					</span>
					<span class="font-label-sm text-label-sm">Terakreditasi Kurikulum JLPT Resmi</span>
				</div>
			</div>

			<div>
				<div class="mb-space-md font-label-lg text-label-lg font-semibold tracking-wide text-on-surface uppercase">Jalur JLPT</div>
				<ul class="space-y-space-sm font-body-sm text-body-sm text-on-surface-variant">
					<li><button type="button" onclick={(e) => scrollTo('harga', e)} class="text-left transition-colors hover:text-on-surface">JLPT N5 (Pemula Dasar)</button></li>
					<li><button type="button" onclick={(e) => scrollTo('harga', e)} class="text-left transition-colors hover:text-on-surface">JLPT N4 (Pemula Lanjutan)</button></li>
					<li><button type="button" onclick={(e) => scrollTo('harga', e)} class="text-left transition-colors hover:text-on-surface">JLPT N3 (Menengah Mandiri)</button></li>
					<li><button type="button" onclick={(e) => scrollTo('harga', e)} class="text-left transition-colors hover:text-on-surface">JLPT N2 (Bisnis &amp; Akademik)</button></li>
					<li><button type="button" onclick={(e) => scrollTo('harga', e)} class="text-left transition-colors hover:text-on-surface">JLPT N1 (Penutur Mahir)</button></li>
				</ul>
			</div>

			<div>
				<div class="mb-space-md font-label-lg text-label-lg font-semibold tracking-wide text-on-surface uppercase">Sumber Belajar</div>
				<ul class="space-y-space-sm font-body-sm text-body-sm text-on-surface-variant">
					<li><button type="button" onclick={(e) => scrollTo('kosakata', e)} class="text-left transition-colors hover:text-on-surface">Kamus Kanji Radikal</button></li>
					<li><button type="button" onclick={(e) => scrollTo('kursus', e)} class="text-left transition-colors hover:text-on-surface">Bank Pola Tata Bahasa (Bunpo)</button></li>
					<li><button type="button" onclick={(e) => scrollTo('kosakata', e)} class="text-left transition-colors hover:text-on-surface">Latihan Mendengarkan (Choukai)</button></li>
					<li><button type="button" onclick={(e) => scrollTo('latihan', e)} class="text-left transition-colors hover:text-on-surface">Simulasi Tryout &amp; Timer</button></li>
					<li><button type="button" onclick={(e) => scrollTo('ai-scheduler', e)} class="text-left transition-colors hover:text-on-surface">Grup Diskusi &amp; Sensei AI</button></li>
				</ul>
			</div>

			<div>
				<div class="mb-space-md font-label-lg text-label-lg font-semibold tracking-wide text-on-surface uppercase">Bantuan &amp; Legal</div>
				<ul class="space-y-space-sm font-body-sm text-body-sm text-on-surface-variant">
					<li><a href="/signin" class="transition-colors hover:text-on-surface">Panduan Pengguna Baru</a></li>
					<li><a href="/signin" class="transition-colors hover:text-on-surface">Kebijakan Privasi</a></li>
					<li><a href="/signin" class="transition-colors hover:text-on-surface">Syarat &amp; Ketentuan</a></li>
					<li><a href="/signin" class="transition-colors hover:text-on-surface">Pusat Bantuan &amp; FAQ</a></li>
					<li><a href="/signin" class="transition-colors hover:text-on-surface">Hubungi Kami</a></li>
				</ul>
			</div>
		</div>

		<div class="flex flex-col items-center justify-between gap-space-sm border-t border-outline-variant/30 pt-space-lg font-body-sm text-body-sm text-on-surface-variant sm:flex-row" use:viewportReveal={{ direction: 'up', delay: 200 }}>
			<div>© 2025 Ganbare Japanese Learning Platform. Hak Cipta Dilindungi Undang-Undang.</div>
			<div class="flex items-center gap-space-md text-on-surface-variant">
				<span class="flex items-center gap-space-xs">
					<Languages class="size-3.5" /> Bahasa Indonesia
				</span>
				<span>•</span>
				<span>Tokyo &amp; Jakarta</span>
			</div>
		</div>
	</div>
</footer>
