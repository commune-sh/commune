import { PUBLIC_HOMESERVER } from '$env/static/public';
import * as sdk from 'matrix-js-sdk';

import { createAppStore } from './app.svelte.js';
const app = createAppStore();

let homeserver = $derived(app.homeserver)

let client = $state(null)

let synced = $state(false)

let rooms = $state(null)

let spaces = $state([])

export function createMatrixStore() {

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

        console.log(room)
        room.timeline.forEach((item) => {
          let event = item.event


          switch(event.type) {
            case "m.room.name":
              space.name = event.content.name
              break;
            case "m.room.canonical_alias":
              space.canonical_alias = event.content.alias
              break;
            case "m.room.avatar":
              space.avatar_url = event.content.url
              break;
            case "m.room.join_rules":
              space.join_rule = event.content.join_rule
              break;
            case "m.room.topic":
              space.topic = event.content.topic
              break;
            case "m.room.guest_access":
              space.guest_access = event.content.guest_access
              break;
            case "m.room.history_visibility":
              if(event.content.history_visibility == "world_readable") {
                space.world_readable = true
              }
              break;
          }
        })


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

    setup,
    updateSpaces,

  };

}
