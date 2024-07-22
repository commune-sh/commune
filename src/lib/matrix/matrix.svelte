<script>
import { browser  } from '$app/environment'
import { onMount } from 'svelte'
import { page } from '$app/stores';

import { 
    naiveRoomIDCheck,
    naiveOSTCheck
} from '$lib/utils/matrix'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

const client = $derived(store.matrix.client)

const authReady = $derived(store.auth.ready)
const authenticated = $derived(store.auth.authenticated)

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
    if(store.app.appservice_reachable && 
        !public_spaces_fetched &&
        !store.auth.authenticated &&
        !data.access_token_exists) {
        console.log("Fetching public spaces.")
        public_spaces_fetched = true
        store.matrix.fetchPublicRooms()
    }
})

const active_space = $derived.by(() => {
    const is_room_id = naiveRoomIDCheck($page.params.space)
    const key = is_room_id ? `room_id` : `commune_alias`
    return store.matrix.rooms?.filter(r => r[key] == $page.params.room)[0]
})




onMount(() => {
})


</script>
