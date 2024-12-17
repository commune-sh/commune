import { SvelteMap } from 'svelte/reactivity';

import { 
  PUBLIC_APP_NAME, 
  PUBLIC_HOMESERVER,
} from '$env/static/public';

import { browser } from '$app/environment';
//import * as sdk from 'matrix-js-sdk';
let sdk;
let loaded = $state(false);


if(browser && !loaded) {
  setTimeout(async () => {
    sdk = await import('matrix-js-sdk');
    loaded = true;
    client =  sdk.createClient({
      baseUrl: homeserver,
    });
    console.log("sdk loaded")
  }, 7000)
}

import { 
  aliasFromName,
  processRooms, 
  processRoomStates,
  processSpaces, 
  buildPublicSpaces, 
  buildSpacesHierarchy ,
  processHash
} from '$lib/utils/matrix';

import { 
  openidConfig,
  login,
  register,
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
  getEventContext,
} from '$lib/appservice/requests'

import { createAppStore } from './app.svelte.js';
const app = createAppStore();
import { createAuthStore } from './auth.svelte.js';
const auth = createAuthStore();
import { createUIStore } from './ui.svelte.js';
const ui = createUIStore();

let oidc_issuer = $state(null);
let oidc_config = $state(null);

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

let thread_events = $state({})

if(browser) {
  /*
  client =  sdk.createClient({
    baseUrl: homeserver,
  });
  */
}

let page = $state(null);

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

const active_space = $derived.by(() => {
  if(!page?.params?.space && page?.url?.hash == null) return


  let space_param;

  if(page?.url?.hash) {
    const params = processHash(page.url.hash)
    if(params?.space) {
      space_param = params.space
    }
  } else if(page?.params?.space) {
    space_param = page.params.space
  }

  if(!space_param) {
    return null
  }

  const is_room_id = naiveRoomIDCheck(space_param)
  const key = is_room_id ? `room_id` : `canonical_alias`
  const val = is_room_id ? space_param : canonical_alias(space_param)

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


export function createMatrixStore() {

  // temporary throaway client for single requests
  function newClient() {
    return sdk.createClient({
      baseUrl: homeserver,
    });
  }

  // fetch login and registration flows from homeserver
  async function getFlows() {


    /*
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
    //
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
    */
    //
    //
    // check if OIDC issuer is set
    if(oidc_issuer) {
      console.log("Fetching OIDC config:", oidc_issuer)
      try {
        let response = await openidConfig(oidc_issuer)
        if(response) {
          oidc_config = response
          console.log("OIDC config:", oidc_config)
        }
      } catch(err) {
        console.log("Error fetching OIDC config:", err)
      }
    }


    try {
      let response = await login()
      if(response?.flows) {
        login_flows = response.flows
      }
    } catch (_){
      app.homeserverUnreachable()
    }


    // registration flows
    try {
      let response = await register()
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
    const resp = await getPublicRooms(app.appservice)
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

  async function fetchRoomState(room_id) {
    const state = room_state[room_id]
    if(state) {
      return
    }
    const resp = await getRoomState(app.appservice, room_id)
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

    try {

      const filter = {
        lazy_load_members: true,
      }

      const resp = await getRoomMessages(app.appservice, {
        room_id: opts.room_id,
        authenticated: auth.authenticated,
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

  async function fetchEventContext(opts) {

    try {
      const filter = {
        lazy_load_members: true,
      }

      const resp = await getEventContext(app.appservice, {
        room_id: opts.room_id,
        event_id: opts.event_id,
        authenticated: auth.authenticated,
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
      const resp = await getEventContext(app.appservice, {
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
    //console.log("Updating page:", p)
  }

  function updateOIDCIssuer(issuer) {
    console.log("Updating OIDC issuer:", issuer)
    oidc_issuer = issuer
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
    fetchEventContext,
    fetchThreadEvents,
    registerGuest,
    updatePage,
    updateOIDCIssuer,
  };

}
