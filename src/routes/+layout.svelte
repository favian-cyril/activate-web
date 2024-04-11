<script lang="ts">
	import '../app.postcss';
	import { initializeStores, Toast } from '@skeletonlabs/skeleton';

	initializeStores();
</script>

<slot />
<Toast />
