let capabilities = $state(null);

let app = $state({
  space: null,
});

let ui_state = $state({
  auth_toggled: false,
  public_rooms_fetched: false,
});

export function createStore() {

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
    capabilities = data;
	}

	return {
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
    publicRoomsFetched,
		updateSpace,
    toggleAuth,
    updateCapabilities,
	};
}
