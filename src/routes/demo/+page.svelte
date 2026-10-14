<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
</script>

<button type="button" onclick={() => goto(resolve('/demo/paraglide'))}>paraglide</button>
