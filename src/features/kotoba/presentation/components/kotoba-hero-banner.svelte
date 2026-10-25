<script lang="ts">
	import bannerBg from '$lib/assets/images/kotoba-banner-bg.png';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
</script>

<Card.Root
	class="w-full justify-between bg-cover bg-center bg-no-repeat text-slate-900"
	style={`background-image: url('${bannerBg}'); background-position: center 70%;`}
>
	<Card.Content class="flex flex-col items-start gap-4">
		<Badge class="px-3 py-3 text-sm">Kotoba</Badge>
		<h1 class="text-2xl leading-snug font-bold tracking-tight lg:text-3xl lg:leading-tight">
			Perluas Kosakata dan Tingkatkan
			<br class="hidden sm:inline" />
			Kemampuan Bahasa Jepangmu
		</h1>
		<p class="max-w-xl text-sm leading-relaxed text-muted-foreground">
			Pelajari kosakata bahasa Jepang berdasarkan level dan topik pembelajaran. Pilih topik yang
			ingin kamu kuasai dan mulai belajar secara bertahap.
		</p>
	</Card.Content>
</Card.Root>
