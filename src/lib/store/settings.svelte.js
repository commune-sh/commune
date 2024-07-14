let unsaved_changes = $state(false);

let settings = $state(null);

export function createSettingsStore() {

  function setUnsaved() {
    unsaved_changes = true
  }

  function setSaved() {
    unsaved_changes = false
  }

  function updateSettings(data) {
    settings = data
  }


	return {

		get unsaved_changes() {
			return unsaved_changes
		},

    setUnsaved,
    setSaved,
    updateSettings,
	};
}
