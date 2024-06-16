let ready = $state(false);

let access_token_valid = $state(false);
let access_token_validated = $state(false);

let credentials = $state(null);

let accounts = $state(null);

let authenticated = $state(false);

export function createAuthStore() {

  function setup() {
    console.log("Setting up Auth store.")

    const access_token = localStorage.getItem('mx_access_token')
    const user_id = localStorage.getItem('mx_user_id')
    const device_id = localStorage.getItem('mx_device_id')

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
    access_token_validated = true;
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

    get access_token_validated() {
      return access_token_validated;
    },

    setup,
    purge,
    validateAccessToken,
    };
}
