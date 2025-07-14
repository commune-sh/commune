import { SvelteMap } from 'svelte/reactivity';
import * as sdk from 'matrix-js-sdk/src/index';
import { MatrixClient } from 'matrix-js-sdk/src/client';

import { page as _page } from '$app/state';

import { app } from './app.svelte';

import { createSessionStore } from './session.svelte';
const session_store = createSessionStore();

const authenticated = $derived(session_store.authenticated);


import { browser } from '$app/environment';


import { type PublicSpace } from '../types/common';

import { get_local_part, is_local_room } from '../utils/matrix';

import { 
    aliasFromName,
    processRooms, 
    processRoomStates,
    processSpaces, 
    buildPublicSpaces, 
    buildSpacesHierarchy ,
    processHash
} from '../utils/matrix';

import { 
    naiveRoomIDCheck,
    canonical_alias,
} from '../utils/matrix'

import {
    processSpaceRooms,
    processRoomState,
} from '../store/process.svelte'

import { 
    getPublicSpaces,
    getPublicRooms, 
    getRoomState,
    getRoomMessages,
    getEventContext,
} from '../appservice/requests.svelte'


let oidc_issuer = $state(null);

let login_flows = $state(null);
let register_flows = $state(null);
let registration_disabled = $state(false);

let client: MatrixClient = $state(sdk.createClient({
    baseUrl: app.HOMESERVER_URL as string,
}));

let session = $derived(session_store.session)

let _access_token: string = $state('');

let status: {
    started_at: number;
    synced: boolean;
} = $state({
    started_at: Date.now(),
    synced: false,
})

$effect.root(() => {
    $effect(() => {
        if(browser && session) {
            setupClient()
        }
        if(client && _access_token != '' && _access_token != session?.access_token) {
            updateToken()
        }
    })
})

async function setupClient() {
    console.log("Session is", session)
    console.log("Session is ready, set up Matrix client")
    _access_token = session?.access_token as string
    client =  sdk.createClient({
        baseUrl: app.HOMESERVER_URL as string,
        accessToken: session?.access_token,
        refreshToken: session?.refresh_token,
        userId: session?.user_id,
        deviceId: session?.device_id,
    });
    setupListeners()
    client.startClient();
}

async function updateToken() {
    console.log("Updating access token.")
    _access_token = session?.access_token as string
    client?.stopClient();
    client?.removeAllListeners();
    client?.setAccessToken(session?.access_token as string);
    client?.startClient();
}

let synced = $state(false)

let rooms = $state(null)

let spaces = $state([])

let room_state = $state({})

let messages = $state({})

let hierarchy = $state({})

let events = $state({})

let thread_events = $state({})

if(browser) {
}

let page = $derived.by(() => {
    if(browser && _page) {
        return _page
    }
})

export let store: {
    spaces: SvelteMap<string, any>;
    space_rooms: SvelteMap<string, any>;
    rooms: SvelteMap<string, any>;
    room_state: SvelteMap<string, SvelteMap<string, any>>;
    messages: SvelteMap<string, any>;
    hierarchy: SvelteMap<string, any>;
    events: SvelteMap<string, any>;
    thread_events: SvelteMap<string, any>;
} = $state({
    spaces: new SvelteMap(),
    space_rooms: new SvelteMap(),
    rooms: new SvelteMap(),
    room_state: new SvelteMap(),
    messages: new SvelteMap(),
    hierarchy: new SvelteMap(),
    events: new SvelteMap(),
    thread_events: new SvelteMap(),
});


let space = $derived.by(() => {
    return page?.params?.space;
})

let space_room_id = $derived.by(() => {
    if(!space) return null;
    return store.spaces.get(space)?.room_id;
})

let space_state = $derived.by(() => {
    if(!space_room_id) return null;
})

let room = $derived.by(() => {
    return page?.params?.room;
})

let _space: string | undefined = $state(undefined);
let _room: string | undefined = $state(undefined);

$effect.root(() => {
    $effect(() => {
        if(_space != space && app.APPSERVICE_URL) {
            _space = space;
            //processSpaceRooms(_space, app.APPSERVICE_URL);
        }
        if(_room != room) {
            _room = room;
        }
        /*
        if(space && (_space != space)) {
            _space = space;
            console.log("SPACE IS ", _space)
        }
        if(space_room_id) {
            console.log("SPACE ROOM ID IS ", space_room_id)
        }
        if(room && (_room != room)) {
            _room = room;
            console.log("ROOM IS ", _room)
        }
        */
    })
})


const active_room = $derived.by(() => {
    if(!page?.params?.room && page?.url?.hash == null) return

    let room_param;

    if(page?.url?.hash) {
        const params = processHash(page.url.hash)
        if(params?.room) {
            room_param = params.room
        }
    } else if(page?.params?.room) {
        room_param = page.params.room
    }

    if(!room_param) {
        return null
    }

    const is_room_id = naiveRoomIDCheck(room_param)
    const key = is_room_id ? `room_id` : `commune_alias`

    if(page.params.space || page.url?.hash) {
        return rooms?.filter(r => r[key] == room_param && r.parent == active_space?.room_id)[0]
    }

    return rooms?.filter(r => r[key] == room_param && !r.parent)[0]
})

let space_prefixed = $derived.by(() => {
    if(!page?.params?.space) return null
    return `#${page.params.space}`;
})

const not_local_space = $derived.by(() => {
    if(!space) return null
    return space.includes(':')
})

const active_space = $derived.by(() => {
    if(!app?.HOMESERVER_NAME || !space_prefixed) return null
    if(!page?.params?.space && page?.url?.hash == null) return

    let space_param = page.params.space;

    if(not_local_space) {
        return rooms?.filter(r => r['canonical_alias'] == space_prefixed)[0]
    }

    if(!space_param) {
        return null
    }

    const is_room_id = naiveRoomIDCheck(space_param)
    const key = is_room_id ? `room_id` : `canonical_alias`
    const val = is_room_id ? space_param : canonical_alias(space_param, app.HOMESERVER_NAME as string)

    return rooms?.filter(r => r[key] == val)[0]
})

const active_room_events = $derived.by(() => {
    return events[active_room?.room_id]?.events
})

const active_room_state = $derived.by(() => {
    return room_state[active_room?.room_id]
})

const is_alias = $derived.by(() => {
    if(!page?.params?.space) return
    return !naiveRoomIDCheck(page.params.space)
})

const space_rooms = $derived.by(() => {
    if(!page?.params?.space) return
    let key = is_alias ? 'canonical_alias' : 'room_id'
    let val = is_alias ? canonical_alias(page.params.space) : page.params.space
    let i = rooms?.filter(room => room[key] == val)[0]
    if(i?.children?.length > 0) {
        let items = []
        i.children.forEach(child => {
            let item = rooms?.find(room => room.room_id == child)
            if(!item?.children) {
                items.push(item)
            }
        })
        return items
    }
})


function setupListeners() {
    if(!client) return
    client.on("sync", (state, prevState, data) => {
        if(state === "PREPARED") {
            status.synced = true

            const items = client.getRooms();
            rooms = processRooms(items)

            room_state = processRoomStates(items)

            if(spaces?.length > 0) {
                console.log("removing existing public spaces")
                spaces = []
            }
            spaces = processSpaces(items)


            //buildRoomEvents()
            synced = true

            const settings = client.getAccountData("commune.web.settings");
            if(settings) {
                //account_data = settings
                app.settings.updateSettings(settings)
            }

        }
    });

    client.on(sdk.RoomEvent.Timeline, (event, room, toStartOfTimeline) => {
        if(!synced) return
        console.log("New event: ", event)
        const items = messages[event.event.room_id]?.events
        const exists = items?.find(e => e.event_id == event.event.event_id)
        if(!exists) {
            messages[event.event.room_id]?.events.push(event.event)
            console.log(messages[event.event.room_id])
        }

    });
}

export function createMatrixStore() {

    // temporary throaway client for single requests
    function newClient() {
        return sdk.createClient({
            baseUrl: app.HOMESERVER_URL as string,
        });
    }


    async function setup(credentials) {

        console.log("Setting up Matrix client for:", credentials.user_id)
        client = sdk.createClient({
            baseUrl: app.HOMESERVER_URL as string,
            accessToken: credentials.access_token,
            userId: credentials.user_id,
        });

        await client.startClient();


        client.on("sync", (state, prevState, data) => {
            if(state === "PREPARED") {

                const items = client.getRooms();
                rooms = processRooms(items)

                room_state = processRoomStates(items)

                if(spaces?.length > 0) {
                    console.log("removing existing public spaces")
                    spaces = []
                }
                spaces = processSpaces(items)


                //buildRoomEvents()

                watchRoomEvents()

                synced = true

                const settings = client.getAccountData("commune.web.settings");
                if(settings) {
                    //account_data = settings
                    app.settings.updateSettings(settings)
                }

            }
        });

    }

    function watchRoomEvents() {
        client.on(sdk.RoomEvent.Timeline, (event, room, toStartOfTimeline) => {

            console.log("New event: ", event)


            const items = messages[event.event.room_id]?.events
            const exists = items?.find(e => e.event_id == event.event.event_id)
            if(!exists) {
                messages[event.event.room_id]?.events.push(event.event)
                console.log(messages[event.event.room_id])
            }

            /*
      if (!toStartOfTimeline) {
        const roomId = room.roomId;
        if (!events[roomId]) {
          events[roomId] = [];
        }

        const eventId = event.getId();
        const eventExists = events[roomId].some(ev => ev.event_id === eventId);
        if (!eventExists) {
          events[roomId].push(event.event);
        }
      }
      */

        });

    }

    /*
  function buildRoomEvents() {
    const rooms = client.getRooms();
    rooms.forEach(room => {
      const roomId = room.roomId;
      const timeline = room.getLiveTimeline();
      const roomEvents = timeline.getEvents();
      events[roomId] = roomEvents.map(event => event.event);
    });
  }
  */

    function addRoom(room) {
        console.log("Adding room.", room)
        if(rooms?.length > 0) {
            const exists = rooms?.find((r) => r.room_id === room.room_id)
            if(!exists) {
                rooms.push(room)
            }
        } else {
            rooms = [room]
        }
    }

    function addSpace(space) {
        console.log("Adding space.", space)
        const exists = spaces?.find((r) => r.room_id === space.room_id)
        if(!exists) {
            spaces.push(space)
        }
    }


    function saveAccountData(type, content) {
        console.log("Storing account data:", type, content)
        client.setAccountData(type, content).then(() => {
            console.log("Account data set successfully");
        }).catch(err => {
                console.error("Error setting account data:", err);
            });
    }

    function updateTheme(theme) {
        console.log("Storing theme in account data:", theme)
        const content = {theme: theme}
        client.setAccountData("commune.web.theme", content).then(() => {
            console.log("Account data set successfully");
        }).catch(err => {
                console.error("Error setting account data:", err);
            });
    }

    async function getHierarchy(room_id) {
        if(!room_id) return null;

        try {
            let url = `${app.APPSERVICE_URL}/_matrix/client/v1/rooms/${room_id}/hierarchy`
            let response = await fetch(url)   
            let data = await response.json()
            if(data?.rooms) {
                const exists = hierarchy[room_id]
                if(!exists) {
                    hierarchy[room_id] = data.rooms
                }
                //let sorted = buildHierarchy(clone)
                //console.log(sorted)
                let parents = buildSpacesHierarchy(data)
                console.log(parents)
            }
        } catch (err){
            console.log("Error fetching hierarchy:", err)
        }
    }

    async function fetchPublicRooms(appservice_url: string) {
        const resp = await getPublicRooms(appservice_url)
        if(resp?.rooms) {

            resp.rooms.forEach(room => {
                let name = room?.name ? room.name : `Untitled Room`
                if(room?.type != 'm.space') {
                    room.commune_alias = aliasFromName(name)
                }
            })

            resp.rooms.forEach(room => {
                if(room?.children?.length > 0) {
                    let items = [];
                    room.children.forEach( c => {
                        let item = resp.rooms.find(r => r.room_id == c)
                        if(item) {
                            items.push(item)
                            item.parent = room.room_id
                        }
                    })
                    items?.sort((a, b) => {
                        return a.origin_server_ts - b.origin_server_ts
                    })
                    items.forEach(c => {
                        let b = items.filter(r => r.room_id != c.room_id && r.commune_alias == c.commune_alias)
                        b.forEach(x => {
                            x.commune_alias = `${x.commune_alias}-${x.origin_server_ts}`
                        })
                    })
                }
            })

            rooms = resp.rooms

            let parents = buildPublicSpaces(resp.rooms)
            spaces = parents
        }
    }

    async function fetchRoomState(room_id: string, appservice_url: string) {
        const state = room_state[room_id]
        if(state) {
            return
        }
        const resp = await getRoomState(room_id, appservice_url)
        if(resp) {
            processRoomState(room_id, resp)
            console.log("Processed state events for room:", room_id, store.room_state.get(room_id));
            room_state[room_id] = resp
        }

    }

    async function fetchRoomMessages(appservice_url: string, homeserver_url: string, opts: any) {

        const stored = events[opts?.room_id]

        const items = stored?.events
        const start = stored?.start
        const end = stored?.end

        if(items?.length > 0 && end == undefined)  {
            return
        }

        try {

            const filter = {
                lazy_load_members: true,
            }

            const resp = await getRoomMessages(appservice_url, homeserver_url, {
                room_id: opts.room_id,
                authenticated: authenticated,
                start: start,
                end: end,
                filter: filter,
            })

            if(resp && !end && !start) {

                let r = {
                    events: [],
                    events_map: new Map(), 
                    start: resp.start, 
                    end: resp.end,
                }
                resp?.chunk?.reverse().forEach(e => {
                    r.events.push(e)
                    r["events_map"].set(e.event_id, e)
                })
                events[opts.room_id] = r
                console.log("Stored room events for:", opts.room_id, events[opts.room_id])
            }

            if(resp && end) {
                stored.events.unshift(...resp.chunk.reverse())
                resp?.chunk?.forEach(e => {
                    stored["events_map"].set(e.event_id, e)
                })
                stored.start = resp.start
                stored.end = resp.end

                console.log("Stored more room messages:", events[opts.room_id])
            }

            return true;

        } catch(err) {
            return err;
        }



    }

    async function fetchEventContext(appservice_url: string, homeserver_url: string, opts: any) {

        try {
            const filter = {
                lazy_load_members: true,
            }

            const resp = await getEventContext(appservice_url, homeserver_url, {
                room_id: opts.room_id,
                event_id: opts.event_id,
                authenticated: authenticated,
                filter: filter,
            })

            if(resp) {

                let r = {
                    events: [],
                    events_map: new Map(), 
                    start: resp.start, 
                    end: resp.end,
                }

                /*
        resp?.chunk?.reverse().forEach(e => {
          r.events.push(e)
          r["events_map"].set(e.event_id, e)
        })
        events[opts.room_id] = r
        */

                if(resp?.events_before?.length > 0) {
                    resp.events_before.reverse().forEach(e => {
                        r.events.push(e)
                        r["events_map"].set(e.event_id, e)
                    })
                }
                if(resp?.event) {
                    r.events.push(resp.event)
                    r["events_map"].set(resp.event.event_id, resp.event)
                }
                if(resp?.events_after?.length > 0) {
                    resp.events_after.forEach(e => {
                        r.events.push(e)
                        r["events_map"].set(e.event_id, e)
                    })
                }
                events[opts.room_id] = r

                console.log("Stored event context messages:", events[opts.room_id])
            }

            return true;

        } catch(err) {
            return err;
        }



    }

    async function fetchThreadEvents(opts) {
        try {
            const resp = await getEventContext(app.APPSERVICE_URL, {
                room_id: opts.room_id,
                event_id: opts.event_id,
            })

            if(resp) {
                console.log("Thread events:", resp)
            }
            return true;
        } catch(err) {
            return err;
        }
    }


    function updatePage(p) {
        //page = p
        //console.log("Updating page:", p)
    }

    function updateOIDCIssuer(issuer) {
        console.log("Updating OIDC issuer:", issuer)
        oidc_issuer = issuer
    }

    async function fetchPublicSpaces(appservice_url: string) {
        try {
            let res = await getPublicSpaces(appservice_url);
            if(res) {
                res.forEach((space: PublicSpace) => {
                    let local_part = get_local_part(space.canonical_alias)
                    store.spaces.set(local_part, space)
                })
                console.log("Fetched public spaces:", store.spaces)
            }
        } catch (err) {
            console.error(err)
        }
    }

    return {
        get client() {
            return client;
        },
        get store() {
            return store;
        },
        get synced() {
            return synced;
        },
        get rooms() {
            return rooms;
        },
        get spaces() {
            return spaces;
        },

        get room_state() {
            return room_state;
        },

        get messages() {
            return messages;
        },

        get events() {
            return events;
        },

        get thread_events() {
            return thread_events;
        },

        get login_flows() {
            return login_flows;
        },

        get register_flows() {
            return register_flows;
        },

        get registration_disabled() {
            return registration_disabled;
        },

        get active_space() {
            return active_space;
        },

        get active_room() {
            return active_room;
        },

        get active_room_events() {
            return active_room_events;
        },

        get active_room_state() {
            return active_room_state;
        },

        get space_rooms() {
            return space_rooms;
        },

        get oidc_issuer() {
            return oidc_issuer;
        },

        get status() {
            return status;
        },

        newClient,
        setup,
        addRoom,
        addSpace,
        updateTheme,
        saveAccountData,
        getHierarchy,
        fetchPublicRooms,
        fetchRoomState,
        fetchRoomMessages,
        fetchEventContext,
        fetchThreadEvents,
        updatePage,
        updateOIDCIssuer,
        fetchPublicSpaces,
    };

}
