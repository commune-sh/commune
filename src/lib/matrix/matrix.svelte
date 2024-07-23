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

const active_space = $derived(store.matrix.active_space)
let _active_space = $state(null);

const active_room = $derived(store.matrix.active_room)
let _active_room = $state(null);

$effect(() =>{
    if(active_space && !_active_space) {
        _active_space = active_space.room_id

        store.matrix.fetchRoomState(active_space.room_id)
    }

    if(active_space && (_active_space != active_space.room_id)) {
        // do things here when active space changes
        console.log("space changed")
        _active_space = active_space.room_id

        store.matrix.fetchRoomState(active_space.room_id)
    }

    if(active_room && !_active_room) {
        _active_room = active_room.room_id
    }
    if(active_room && (_active_room != active_room.room_id)) {
        // do things here when active room changes
        console.log("room changed")
        _active_room = active_room.room_id
    }
})
</script>

