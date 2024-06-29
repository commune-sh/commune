import { 
  PUBLIC_HOMESERVER,
  PUBLIC_HOMESERVER_NAME,
  PUBLIC_SERVER,
  PUBLIC_ALLOW_OTHER_HOMESERVERS
} from '$env/static/public';

import { browser } from '$app/environment';
import { getCookie, createCookie } from '$lib/utils/cookie'

let homeserver = $state(PUBLIC_HOMESERVER);
let homeserver_name = $state(PUBLIC_HOMESERVER_NAME);
let public_server = $state(PUBLIC_SERVER);
let allow_other_homeservers = $state(PUBLIC_ALLOW_OTHER_HOMESERVERS);

let native_mode = $state(false);
let capabilities = $state(null);

let public_server_reachable = $state(false);
let homeserver_reachable = $state(true);
let homeserver_versions = $state(null);

let app = $state({
  ready: false,
  space: null,
});

let theme = $state(null);
if(browser) {
  let stored = getCookie("theme");
  if(stored) {
    theme = stored;
  }
}


let ready = $state(false);


export function createAppStore() {

  function setAppReady() {
    ready = true
  }

  function isNativeMode() {
    console.log("Public server doesn't exist or is unreachable. Setting native mode.")
    native_mode = true;
  }

  function updateSpace(space) {
    app.space = space;
  }

  function updateCapabilities(data) {
    console.log("Storing public server capabilities.")
    capabilities = data;
  }

  function updateHomeserverStatus(data) {
    console.log("Storing homeserver versions.")
    homeserver_versions = data;
  }

  function homeserverUnreachable() {
    console.warn("Setting homeserver as unreachable.")
    homeserver_reachable = false;
  }

  function updatePublicServerStatus(data) {
    public_server_reachable = true
  }

  function updateHomeserver(h) {
    console.log("Updating homeserver to: ", h)
    homeserver = h;
  }

  function updatePublicServer(server) {
    public_server = server;
  }

  function toggleTheme() {
    if(!browser) return;
    if (theme == 'dark') {
      theme = 'light'
      document.getElementsByTagName(`html`)[0].setAttribute(`class`, `light`)
      createCookie('theme', 'light')
    } else {
      theme = 'dark'
      document.getElementsByTagName(`html`)[0].setAttribute(`class`, `dark`)
      createCookie('theme', 'dark')
    }
  }

  return {

    get homeserver() {
      return homeserver;
    },

    get public_server() {
      return public_server;
    },

    get ready() {
      return ready;
    },

    get native_mode() {
      return native_mode;
    },

    get space() {
      return app.space;
    },

    get capabilities() {
      return capabilities;
    },

    get homeserver_reachable() {
      return homeserver_reachable;
    },

    get public_server_reachable() {
      return public_server_reachable;
    },

    get theme() {
      return theme;
    },


    updateHomeserver,
    updatePublicServer,
    setAppReady,
    isNativeMode,
    updateSpace,
    updateCapabilities,
    updateHomeserverStatus,
    updatePublicServerStatus,
    homeserverUnreachable,
    toggleTheme
    };
}
