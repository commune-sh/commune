<script>
import { browser  } from '$app/environment'
import { onMount } from 'svelte'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

const client = $derived(store.matrix.client)

const authReady = $derived(store.auth.ready)

const credentials = $derived($state.snapshot(store.auth.credentials))

let ready = $state(false);

$effect(() => {
    if(browser && authReady && credentials && !ready) {
        store.matrix.setup(credentials)
        ready = true
    }
})

</script>
