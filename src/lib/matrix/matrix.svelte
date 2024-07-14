<script>
import { browser  } from '$app/environment'
import { onMount } from 'svelte'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

const client = $derived(store.matrix.client)

const authReady = $derived(store.auth.ready)

const credentials = $derived($state.snapshot(store.auth.credentials))

let ready = $state(false);

let {
    data,
} = $props();


$effect(() => {
    if(browser && authReady && credentials && !ready) {
        if(!data.is_guest) {
            store.matrix.setup(credentials)
        } else if(data.is_guest) {
            //store.matrix.setupGuest(credentials)
        }
        ready = true
    }
})

</script>
