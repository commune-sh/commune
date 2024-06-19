let unsaved_changes = $state(false);

export function createSettingsStore() {


  function setUnsaved() {
    unsaved_changes = true
  }

  function setSaved() {
    unsaved_changes = false
  }

	return {

		get unsaved_changes() {
			return unsaved_changes
		},

    setUnsaved,
    setSaved,
	};
}
