let native_mode = $state(false);
let capabilities = $state(null);

let public_server_reachable = $state(false);

let homeserver_reachable = $state(false);
let homeserver_versions = $state(null);

let app = $state({
  ready: false,
  space: null,
});


export function createAppStore() {

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

    setAppReady,
    isNativeMode,
		updateSpace,
    updateCapabilities,
    updateHomeserverStatus,
    updatePublicServerStatus,
	};
}