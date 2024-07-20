let ui_state = $state({
  menu_active: false,
  auth_active: false,
  settings_active: false,
  public_rooms_fetched: false,
});

let alert = $state({
  active: false,
  message: null,
  type: null,
});

let theme = $state(null);

let routes = $state({})

let scrollPosition = $state({});

let messageCount = $state({});

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

	function toggleMenu() {
    ui_state.menu_active = !ui_state.menu_active;
	}

  function killMenu() {
    ui_state.menu_active = false;
  }

  function newAlert(opts) {
    alert.active = true;
    alert.message = opts?.message;
    alert.type = opts?.type;
  }

  function getRoute(key) {
    return routes[key];
  }

  function updateRoute(key, val) {
    routes[key] = val;
  }

  function updateScrollPosition(key, val) {
    scrollPosition[key] = val;
    console.log("Updated scroll position:", key, val)
  }

  function getMessageCount(key) {
    return messageCount[key]
  }

  function setMessageCount(key, val) {
    messageCount[key] = val;
    console.log("Setting message count:", key, val)
  }


	return {

		get alert() {
			return alert;
		},

		get auth_active() {
			return ui_state.auth_active;
		},

    get settings_active() {
      return ui_state.settings_active;
    },

		get public_rooms_fetched() {
			return ui_state.public_rooms_fetched;
		},

    get menu_active() {
      return ui_state.menu_active;
    },

    get routes() {
      return routes;
    },

    get scrollPosition() {
      return scrollPosition;
    },

    get messageCount() {
      return messageCount;
    },


    publicRoomsFetched,
    openAuth,
    closeAuth,
    openSettings,
    closeSettings,
    toggleMenu,
    killMenu,
    newAlert,
    getRoute,
    updateRoute,
    updateScrollPosition,
    getMessageCount,
    setMessageCount
	};
}
