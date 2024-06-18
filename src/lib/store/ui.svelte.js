let ui_state = $state({
  auth_active: false,
  settings_active: false,
  public_rooms_fetched: false,
});

export function createUIStore() {

	function openAuth() {
    ui_state.auth_active = true;
	}

	function closeAuth() {
    ui_state.auth_active = false;
	}

	function openSettings() {
    ui_state.settings_active = true;
	}

	function closeSettings() {
    ui_state.settings_active = false;
	}

	function publicRoomsFetched() {
    ui_state.public_rooms_fetched = true;
	}

	return {

		get auth_active() {
			return ui_state.auth_active;
		},

    get settings_active() {
      return ui_state.settings_active;
    },

		get public_rooms_fetched() {
			return ui_state.public_rooms_fetched;
		},

    publicRoomsFetched,
    openAuth,
    closeAuth,
    openSettings,
    closeSettings,
	};
}
