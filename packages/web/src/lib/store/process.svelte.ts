import { 
    getRoomState,
    getRoomHierarchy
} from '$lib/appservice/requests.svelte'


import { 
    store
} from '$lib/store/matrix.svelte'

export async function processSpaceRooms(space: string) {
    if(!space) return;

    // check if space rooms already exist, skip if fetched by other process
    if(store.space_rooms.has(space)) {
        return
    }

    // fetch hierarchy for the space
    if(store.hierarchy.has(space)) {
        console.log("Space hierarchy already exists, skipping fetch.")
        return;
    }
    try {
        let resp = await getRoomHierarchy(space);
        if(resp?.rooms) {
            store.hierarchy.set(space, resp.rooms);

            let rooms: Array<any> = [];

            resp.rooms.forEach((room: any) => {
                if(room.children_state?.length == 0) {
                    rooms.push(room)
                }
            })
            // store space rooms
            if(rooms?.length > 0) {
                store.space_rooms.set(space, rooms);
            }

        }
    } catch (err) {
        console.error("Error fetching space hierarchy:", err)
    }

    // fetch state for each room
    let space_rooms = store.space_rooms.get(space);
    if(space_rooms) {
        try {

            const roomsToFetch = space_rooms.filter((room: any) => 
                !store.room_state.has(room.room_id)
            );

            if (roomsToFetch.length > 0) {
                const statePromises = roomsToFetch.map(async (room: any) => {
                    let state = await getRoomState(room.room_id);
                    return { room_id: room.room_id, state };
                });

                const results = await Promise.all(statePromises);
                results.forEach(({ room_id, state }) => {
                    store.room_state.set(room_id, state);
                });
            }
        } catch (err) {
            console.error("Error fetching space rooms state:", err);
        }
    }
}

