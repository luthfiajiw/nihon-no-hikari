<script lang="ts">
	import bannerBg from '$lib/assets/images/banner-bg.png';
	import { Badge } from '$lib/components/ui/badge';

	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();
</script>

<div
	class={`flex w-full flex-col justify-between overflow-hidden rounded-2xl border border-blue-100 bg-cover bg-no-repeat px-6 pt-6 shadow-md ${className}`}
	style="background-image: url('{bannerBg}'); background-position: center bottom;"
>
	<!-- Left Section (Text Details) -->
	<div class="flex flex-col items-start gap-3 lg:col-span-7">
		<Badge variant="secondary" class="bg-blue-500 pt-2 pb-2.5 text-sm text-white">Kursus</Badge>

		<!-- Title -->
		<h1 class="text-2xl leading-snug font-bold tracking-tight text-slate-900 lg:leading-tight">
			Pilih Level dan Mulai
			<br class="hidden sm:inline" />
			Perjalanan Belajar Bahasa Jepangmu
		</h1>

		<!-- Subtitle -->
		<p class="max-w-xl text-sm leading-relaxed text-slate-500">
			Setiap level memiliki materi yang disusun secara bertahap, mulai dari dasar hingga mahir.
			Pilih level yang sesuai dengan kemampuanmu saat ini.
		</p>
	</div>
</div>
