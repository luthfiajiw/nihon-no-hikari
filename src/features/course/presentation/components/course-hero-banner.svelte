<script lang="ts">
	import bannerBg from '$lib/assets/images/banner-bg.png';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';

	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();
</script>

<Card.Root
	class={`w-full justify-between bg-cover bg-center bg-no-repeat text-taupe-900 ${className}`}
	style={`background-image: url('${bannerBg}')`}
>
	<!-- Left Section (Text Details) -->
	<Card.Content class="flex flex-col items-start gap-4">
		<Badge class="px-3 py-3 text-sm">Kursus</Badge>

		<!-- Title -->
		<h1 class="text-2xl leading-snug font-bold tracking-tight lg:text-3xl lg:leading-tight">
			Pilih Level dan Mulai
			<br class="hidden sm:inline" />
			Perjalanan Belajar Bahasa Jepangmu
		</h1>

		<!-- Subtitle -->
		<p class="max-w-xl text-sm leading-relaxed text-taupe-600">
			Setiap level memiliki materi yang disusun secara bertahap, mulai dari dasar hingga mahir.
			Pilih level yang sesuai dengan kemampuanmu saat ini.
		</p>
	</Card.Content>
</Card.Root>
