<script>
import { createStore } from '$lib/store/store.svelte.js'

const store = createStore()


let space = $derived(store.space)

</script>


space {space}

<style>
</style>
