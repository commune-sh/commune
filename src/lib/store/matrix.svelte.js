import { 
  PUBLIC_APP_NAME, 
  PUBLIC_HOMESERVER,
} from '$env/static/public';

import { browser } from '$app/environment';
import * as sdk from 'matrix-js-sdk';

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
        synced = true
        buildUserSpaces()
      }
    });

  }

  function buildUserSpaces() {
    const roomList = client.getRooms();
    if(roomList?.lenght == 0) return;
    roomList.forEach((room) => {
      const is_parent = room.currentState.events.has('m.space.child')
      const is_child = room.currentState.events.has('m.space.parent')
      if(is_parent && !is_child) {

        let space = {
          room_id: room.roomId,
        }


        const state = room.getLiveTimeline().getState(sdk.EventTimeline.FORWARDS)

        const alias_event = state.getStateEvents("m.room.canonical_alias", "")?.event
        space.canonical_alias = alias_event?.content?.alias

        const name_event = state.getStateEvents("m.room.name", "")?.event
        space.name = name_event?.content?.name
            
        const avatar_event = state.getStateEvents("m.room.avatar", "")?.event
        space.avatar_url = avatar_event?.content?.url
            

        const exists = spaces.find((item) => item.room_id === space.room_id)
        if(!exists) {
          spaces.push(space)
        }
      }
    })
    console.log("Built user spaces: ", spaces)
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
    updateSpaces,

  };

}
