import { 
  PUBLIC_HOMESERVER,
  PUBLIC_HOMESERVER_NAME,
  PUBLIC_ALLOW_OTHER_HOMESERVERS
} from '$env/static/public';

import { browser } from '$app/environment';
import { getCookie, createCookie } from '$lib/utils/cookie'

import { v4 as uuidv4 } from 'uuid';

let homeserver = $state(PUBLIC_HOMESERVER);
let homeserver_name = $state(PUBLIC_HOMESERVER_NAME);
let appservice = $state(null);
let allow_other_homeservers = $state(PUBLIC_ALLOW_OTHER_HOMESERVERS);

let native_mode = $state(false);
let capabilities = $state(null);

let appservice_reachable = $state(false);
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

if(browser) {
  let client = getCookie("client_id");
  if(!client) {
    let id = uuidv4();
    createCookie('client_id', id)
  }
}


let ready = $state(false);


export function createAppStore() {

  function isReady() {
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

  function updateAppserviceStatus(state) {
    appservice_reachable = state
  }

  function updateHomeserver(h) {
    console.log("Updating homeserver to: ", h)
    homeserver = h;
  }

  function updateAppservice(url) {
    appservice = url;
  }

  function toggleTheme() {
    if(!browser) return;
    if (theme == 'dark') {
      theme = 'light'
      document.getElementsByTagName(`html`)[0].setAttribute(`class`, `light`)
      localStorage.setItem('theme', 'light')
      createCookie('theme', 'light')
    } else {
      theme = 'dark'
      document.getElementsByTagName(`html`)[0].setAttribute(`class`, `dark`)
      localStorage.setItem('theme', 'dark')
      createCookie('theme', 'dark')
    }
  }

  return {

    get homeserver() {
      return homeserver;
    },

    get appservice() {
      return appservice;
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

    get appservice_reachable() {
      return appservice_reachable;
    },

    get theme() {
      return theme;
    },


    updateHomeserver,
    updateAppservice,
    isReady,
    isNativeMode,
    updateSpace,
    updateCapabilities,
    updateHomeserverStatus,
    updateAppserviceStatus,
    homeserverUnreachable,
    toggleTheme
    };
}
