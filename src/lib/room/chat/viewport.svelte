<script>
import { onMount, tick } from 'svelte'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

let {
    messages
} = $props();
</script>
