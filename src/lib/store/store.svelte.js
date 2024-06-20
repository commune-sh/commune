let native_mode = $state(false);
let capabilities = $state(null);

let public_server_reachable = $state(false);

let homeserver_reachable = $state(false);
let homeserver_versions = $state(null);

let app = $state({
  ready: false,
  space: null,
});

let spaces = $state([])

export function createStore() {

	function setAppReady() {
    app.ready = true
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
    homeserver_reachable = true;
    homeserver_versions = data;
	}

	function updatePublicServerStatus(data) {
    public_server_reachable = true
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

		get ready() {
			return app.ready;
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

		get spaces() {
			return spaces;
		},

    setAppReady,
    isNativeMode,
		updateSpace,
    updateCapabilities,
    updateHomeserverStatus,
    updatePublicServerStatus,
    updateSpaces,
	};
}
