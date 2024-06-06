let app = $state({
  space: null,
});

export function createStore() {

	function updateSpace(space) {
    app.space = space;
	}

	return {
		get space() {
			return app.space;
		},
		updateSpace
	};
}
