import { 
  PUBLIC_APP_NAME, 
  PUBLIC_HOMESERVER,
} from '$env/static/public';

import { browser } from '$app/environment';
import * as sdk from 'matrix-js-sdk';

import { processRooms } from '$lib/utils/matrix';

import { createAppStore } from './app.svelte.js';
const app = createAppStore();
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

let events = $state({})

if(browser) {
  client =  sdk.createClient({
    baseUrl: homeserver,
  });
}

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
        rooms = items
        spaces = processRooms(items)

        buildRoomEvents()

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


  function watchRoomEvents() {
    client.on(sdk.RoomEvent.Timeline, (event, room, toStartOfTimeline) => {

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
    });

  }

  function buildRoomEvents() {
    const rooms = client.getRooms();
    rooms.forEach(room => {
      const roomId = room.roomId;
      const timeline = room.getLiveTimeline();
      const roomEvents = timeline.getEvents();
      events[roomId] = roomEvents.map(event => event.event);
    });
  }

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


  function updateSpaces(items) {
    console.log("Storing spaces.", items)
    //spaces = items;
    items.forEach((item) => {
      const exists = spaces.find((space) => space.room_id === item.room_id)
      if(!exists) {
        spaces.push(item)
      }
    })
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
        console.log(data.rooms)
      }
    } catch (err){
      console.log("Error fetching hierarchy:", err)
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

    get login_flows() {
      return login_flows;
    },

    get register_flows() {
      return register_flows;
    },

    get registration_disabled() {
      return registration_disabled;
    },


    newClient,
    getFlows,
    setup,
    addRoom,
    addSpace,
    updateSpaces,
    updateTheme,
    saveAccountData,
    getHierarchy,
  };

}
