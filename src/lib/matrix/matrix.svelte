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
        console.log("Fetching public spaces.")
        public_spaces_fetched = true
        store.matrix.fetchPublicRooms()
    }
    if(room) {
        store.matrix.updateActiveRoom(room)
    }
})

const room = $derived.by(() => {
    const is_room_id = naiveRoomIDCheck($page.params.room)
    const key = is_room_id ? `room_id` : `commune_alias`
    return store.matrix.rooms?.filter(r => r[key] == $page.params.room)[0]
})

const room_state = $derived.by(() => {
    return store.matrix.room_state[$page.params.room]
})

onMount(() => {
})


</script>
