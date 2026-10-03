<script lang="ts">
	import { Skeleton } from '$lib/components/ui/skeleton';
</script>

<div class="h-full min-w-0 flex-1 overflow-hidden" aria-label="Memuat materi" aria-busy="true">
	<div class="mx-auto max-w-5xl px-6 pt-6 pb-16">
		<Skeleton class="mb-8 h-8 w-2/3 max-w-md" />

		<div class="space-y-4">
			<Skeleton class="h-4 w-full" />
			<Skeleton class="h-4 w-11/12" />
			<Skeleton class="h-4 w-4/5" />
			<div class="h-2"></div>
			<Skeleton class="h-4 w-full" />
			<Skeleton class="h-4 w-full" />
			<Skeleton class="h-4 w-3/4" />
			<div class="h-2"></div>
			<Skeleton class="h-4 w-5/6" />
			<Skeleton class="h-4 w-full" />
			<Skeleton class="h-4 w-2/3" />
		</div>
	</div>
</div>
