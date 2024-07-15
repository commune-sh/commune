<script>
import { browser  } from '$app/environment'
import { onMount } from 'svelte'
import { page } from '$app/stores';

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

const client = $derived(store.matrix.client)

const authReady = $derived(store.auth.ready)

const credentials = $derived($state.snapshot(store.auth.credentials))

let ready = $state(false);

let {
    data,
} = $props();

let space = $derived($page.params.space)
let space_exists = $derived($page.params.space !== undefined)


let public_spaces_fetched = $state(false)

$effect(() => {
    if(browser && authReady && credentials && !ready) {
        if(!data.is_guest) {
            store.matrix.setup(credentials)
        } else if(data.is_guest) {
            //store.matrix.setupGuest(credentials)
        }
        ready = true
    }
    /*
    if(space_exists) {
        let h = store.matrix.hierarchy?.[space]
        if(!h && store.app.appservice_reachable) {
            //store.matrix.getHierarchy(space)
        }
    }
    if(data?.space && store.app.appservice_reachable) {
        store.matrix.addSpace(data.space)
    }
    */
    if(store.app.appservice_reachable && 
        !public_spaces_fetched &&
        !store.auth.authenticated &&
        !data.access_token_exists) {
        console.log("fetching public spaces")
        public_spaces_fetched = true
        store.matrix.fetchPublicRooms()
    }
})

onMount(() => {
})


</script>
