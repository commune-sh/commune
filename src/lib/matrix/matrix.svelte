<script>
import { browser  } from '$app/environment'
import { onMount } from 'svelte'
import { page } from '$app/state';
import { SvelteMap } from 'svelte/reactivity';
import { v4 as uuidv4 } from 'uuid';

import { 
    naiveRoomIDCheck,
    naiveOSTCheck
} from '$lib/utils/matrix'

import { createStore } from '$lib/store/store.svelte'
const store = createStore()

const client = $derived(store.matrix.client)

const authenticated = $derived(store.session.authenticated)

let {
    data,
} = $props();

let space = $derived(page.params.space)
let room = $derived(page.params.room)
let space_exists = $derived(page.params.space !== undefined)


let public_spaces_fetched = $state(false)

$effect(() => {
    if(data.authenticated == false) {
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
    if(active_space && !active_room) {
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
        //subscribe()
        _active_room = active_room.room_id
    }

})

onMount(() => {
    //sync()
})

let room_id = $derived(active_room?.room_id)

let connected = $state(false);
let socket;

let subscribed = $state(new Set([room_id]));
let events = $state([]);

let client_id = $state(null);

async function sync() {
    connected = true
    client_id = uuidv4();
    socket = new WebSocket(`ws://localhost:8989/sync?client_id=${client_id}&room_id=${room_id}`);

    socket.onopen = function() {
        console.log('WebSocket connection opened');
    };

    socket.onmessage = function(event) {
        const matrixEvent = JSON.parse(event.data);
        console.log('New Matrix event:', matrixEvent);
        events = [...events, matrixEvent];
    };

    socket.onclose = function() {
        console.log('WebSocket connection closed');
    };

    socket.onerror = function(error) {
        console.error('WebSocket error:', error);
    };
}

function subscribe() {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ room_id: room_id }));
        subscribed.add(room_id);
    } else {
        console.error('WebSocket connection is not open');
    }
}

function disconnect() {
    if (socket) {
        socket.close();
    }
}
</script>

