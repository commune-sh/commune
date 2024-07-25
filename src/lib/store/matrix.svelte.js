import { SvelteMap } from 'svelte/reactivity';

import { 
  PUBLIC_APP_NAME, 
  PUBLIC_HOMESERVER,
} from '$env/static/public';

import { browser } from '$app/environment';
import * as sdk from 'matrix-js-sdk';

import { 
  aliasFromName,
  processRooms, 
  processRoomStates,
  processSpaces, 
  buildPublicSpaces, 
  buildSpacesHierarchy } from '$lib/utils/matrix';

import { 
  syncGuest,
} from '$lib/matrix/requests.js';

import { 
  naiveRoomIDCheck,
  canonical_alias,
} from '$lib/utils/matrix'

import { 
  getPublicRooms, 
  getRoomState,
  getRoomMessages,
} from '$lib/appservice/requests'

import { createAppStore } from './app.svelte.js';
const app = createAppStore();
import { createAuthStore } from './auth.svelte.js';
const auth = createAuthStore();
import { createUIStore } from './ui.svelte.js';
const ui = createUIStore();

let login_flows = $state(null);
let register_flows = $state(null);
let registration_disabled = $state(false);

let homeserver = $derived(app.homeserver)

let client = $state(null);

let synced = $state(false)

let rooms = $state(null)

let spaces = $state([])

let room_state = $state({})

let messages = $state({})

let hierarchy = $state({})

let events = $state({})

if(browser) {
  client =  sdk.createClient({
    baseUrl: homeserver,
  });
}

let page = $state(null);

const active_room = $derived.by(() => {
  if(!page?.params?.room) return
    const is_room_id = naiveRoomIDCheck(page.params.room)
    const key = is_room_id ? `room_id` : `commune_alias`
    return rooms?.filter(r => r[key] == page.params.room)[0]
})

const active_space = $derived.by(() => {
  if(!page?.params?.space) return
    const is_room_id = naiveRoomIDCheck(page.params.space)
    const key = is_room_id ? `room_id` : `canonical_alias`
    const val = is_room_id ? page.params.space : canonical_alias(page.params.space)
    return rooms?.filter(r => r[key] == val)[0]
})

const active_room_events = $derived.by(() => {
  return events[active_room?.room_id]?.events
})



export function createMatrixStore() {

  // temporary throaway client for single requests
  function newClient() {
    return sdk.createClient({
      baseUrl: homeserver,
    });
  }

  // fetch login and registration flows from homeserver
  async function getFlows() {

    if(!client) {
      client = newClient()
    }

    // login flows
    try {
      let response = await client.loginFlows()
      if(response?.flows) {
        login_flows = response.flows
      }
    } catch (err){
      if(err.name == "ConnectionError") {
        app.homeserverUnreachable()
      }
    }

    // registration flows
    try {
      let response = await client.register()
      if(response?.flows) {
        console.log("Register flows:", response.flows)
        register_flows = response.flows
      }
    } catch(err) {
      if(err.errcode == "M_FORBIDDEN") {
        registration_disabled = true
      }
      if(err?.data?.flows) {
        register_flows = err.data.flows
      }
      console.log("Registration flows:", register_flows)
    }

  }

  async function recheckHomeserver() {
  }

  async function setup(credentials) {

    console.log("Setting up Matrix client for:", credentials.user_id)
    client = sdk.createClient({
      baseUrl: PUBLIC_HOMESERVER,
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
          account_data = settings
          app.settings.updateSettings(settings)
        }

      }
    });

  }

  async function setupGuest(credentials) {
    console.log("Setting up Matrix guest client for:", credentials.user_id)
    syncGuest(credentials.access_token)
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
      let url = `${app.appservice}/_matrix/client/v1/rooms/${room_id}/hierarchy`
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

  async function fetchPublicRooms() {
    const resp = await getPublicRooms()
    if(resp?.rooms) {

      resp.rooms.forEach(room => {
        let name = room?.name ? room.name : `Untitled Room`
        room.commune_alias = aliasFromName(name)
      })

      resp.rooms.forEach(room => {
        if(room?.children?.length > 0) {
          let items = [];
          room.children.forEach( c => {
            let item = resp.rooms.find(r => r.room_id == c)
            if(item) {
              items.push(item)
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

  async function fetchRoomState(room_id) {
    const state = room_state[room_id]
    if(state) {
      return
    }
    const resp = await getRoomState(room_id)
    if(resp) {
      room_state[room_id] = resp
      console.log("Stored room state for:", room_id)
    }

  }

  async function fetchRoomMessages(opts) {

    const stored = events[opts.room_id]

    const items = stored?.events
    const start = stored?.start
    const end = stored?.end

    if(items?.length > 0 && end == undefined)  {
      return
    }

    const resp = await getRoomMessages({
      room_id: opts.room_id,
      authenticated: auth.authenticated,
      start: start,
      end: end,
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
      stored.start = resp.start
      stored.end = resp.end

      console.log("Stored more room messages:", events[opts.room_id])

    }
  }


  async function registerGuest() {
    try {
      let response = await client.registerGuest()
      if(response?.access_token) {
        console.log("Guest registered:", response)
        auth.saveGuestSession({
          access_token: response.access_token,
          user_id: response.user_id,
          device_id: response.device_id,
          home_server: response.home_server,
        })
      }
    } catch(err) {
      console.log("Error registering guest:", err)
    }
  }


  function updatePage(p) {
    page = p
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

    newClient,
    getFlows,
    setup,
    setupGuest,
    addRoom,
    addSpace,
    updateTheme,
    saveAccountData,
    getHierarchy,
    fetchPublicRooms,
    fetchRoomState,
    fetchRoomMessages,
    registerGuest,
    updatePage
  };

}
