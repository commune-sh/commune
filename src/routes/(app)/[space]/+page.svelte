<script>
import { page } from '$app/stores';
import { createStore } from '$lib/store/store.svelte.js'

const store = createStore()


let space = $derived(store.space)

</script>


space {space} {$page.params.space}

<style>
</style>
