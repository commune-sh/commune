import { 
  PUBLIC_HOMESERVER_URL,
  PUBLIC_HOMESERVER_NAME,
} from '$env/static/public';

import { browser } from '$app/environment';
import { getCookie, createCookie } from '$lib/utils/cookie'

let homeserver = $state(PUBLIC_HOMESERVER_URL);
let homeserver_name = $state(PUBLIC_HOMESERVER_NAME);


let appservice: string | null = $state(null);

let capabilities = $state(null);

let appservice_reachable = $state(false);
let homeserver_reachable = $state(true);
let homeserver_versions = $state(null);

let app = $state({
  ready: false,
  space: null,
});

let theme: string | null = $state(null);

if(browser) {
  let stored = getCookie("theme");
  if(stored) {
    theme = stored;
  }
}

if(browser) {
}


let ready = $state(false);


export function createAppStore() {

  function isReady() {
    ready = true
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
    updateSpace,
    updateCapabilities,
    updateHomeserverStatus,
    updateAppserviceStatus,
    homeserverUnreachable,
    toggleTheme
    };
}
