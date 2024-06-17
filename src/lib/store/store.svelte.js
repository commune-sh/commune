let native_mode = $state(false);
let capabilities = $state(null);

let public_server_reachable = $state(false);

let homeserver_reachable = $state(false);
let homeserver_versions = $state(null);

let app = $state({
  ready: false,
  space: null,
});

let ui_state = $state({
  auth_toggled: false,
  public_rooms_fetched: false,
});

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

	function toggleAuth() {
    ui_state.auth_toggled = !ui_state.auth_toggled;
	}

	function publicRoomsFetched() {
    ui_state.public_rooms_fetched = true;
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

	function updateSpaceItems(data) {
    console.log("Storing homeserver versions.")
    homeserver_reachable = true;
    homeserver_versions = data;
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

		get auth_toggled() {
			return ui_state.auth_toggled;
		},

		get public_rooms_fetched() {
			return ui_state.public_rooms_fetched;
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

    setAppReady,
    isNativeMode,
    publicRoomsFetched,
		updateSpace,
    toggleAuth,
    updateCapabilities,
    updateHomeserverStatus,
    updatePublicServerStatus
	};
}
