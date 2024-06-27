import { createAppStore } from './app.svelte.js';
const app = createAppStore();

let homeserver = $derived(app.homeserver)

import { storeCookies } from '$lib/utils/cookie'
import { whoami } from '$lib/matrix/requests';

let ready = $state(false);

let access_token_valid = $state(false);
let access_token_checked = $state(false);

let credentials = $state(null);

let accounts = $state(null);

let authenticated = $state(false);

let login_flows = $state(null);

export function createAuthStore() {

  async function setup(opts) {

    if(opts?.authenticated && opts?.access_token && opts?.user_id) {
      console.log("Setting up Auth store. User is authenticated.")

      access_token_valid = true;
      access_token_checked = true;

      credentials = {
        access_token: opts.access_token,
        user_id: opts.user_id,
        device_id: opts.device_id,
      }
      authenticated = true;

      ready = true
      return


    } else {
      console.log("Setting up Auth store.")
    }


    const access_token = localStorage.getItem('mx_access_token')
    const user_id = localStorage.getItem('mx_user_id')
    const device_id = localStorage.getItem('mx_device_id')

    if(!access_token || !user_id || !device_id) {
      console.log("No credentials found in local storage.")
      ready = true
      return
    }

    if(access_token && user_id) {

      try {
        const response = await whoami(access_token);
        if(response.errcode == "M_UNKNOWN_TOKEN") {
          console.log("Access token is invalid.")
          //purge();
          access_token_checked = true;
          ready = true
          return
        }
        if(response.user_id == user_id && response.device_id == device_id) {
          console.log("Access token is valid.")
          access_token_valid = true;
          access_token_checked = true;
        }
        //authenticated = true;
      } catch (error) {
        console.log(error)
        //purge();
      }

    }

    if(access_token && user_id && device_id) {
      credentials = {
        access_token: access_token,
        user_id: user_id,
        device_id: device_id,
      }
      console.log("Credentials loaded from local storage.", $state.snapshot(credentials))
    } else {
      console.log("No credentials found in local storage.")
    }

    ready = true
  }

  function purge() {
    localStorage.removeItem('mx_access_token')
    localStorage.removeItem('mx_user_id')
    localStorage.removeItem('mx_device_id')

    credentials = {
      access_token: null,
      user_id: null,
      device_id: null,
    }

    authenticated = false;

  }

  function validateAccessToken() {
    access_token_checked = true;
  }

  function updateLoginFlows(flows) {
    console.log("Storing login flows: ", flows)
    login_flows = flows
  }

  function saveSession(opts) {
    if(!opts?.access_token || 
      !opts?.user_id || 
      !opts?.device_id) {
      return 
    }
    storeCookies({
      mx_access_token: opts.access_token,
      mx_user_id: opts.user_id,
      mx_device_id: opts.device_id,
      mx_home_server: opts.home_server,
    })
    credentials = {
      access_token: opts.access_token,
      user_id: opts.user_id,
      device_id: opts.device_id,
    }
    authenticated = true;
    access_token_valid = true;
    access_token_checked = true;
    ready = true
  }

  return {
    get ready() {
      return ready;
    },

    get authenticated() {
      return authenticated;
    },

    get credentials() {
      return credentials;
    },

    get access_token_valid() {
      return access_token_valid;
    },

    get access_token_checked() {
      return access_token_checked;
    },

    get login_flows() {
      return login_flows;
    },

    setup,
    purge,
    validateAccessToken,
    updateLoginFlows,
    saveSession,
  };
}
