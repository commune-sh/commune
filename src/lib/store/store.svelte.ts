import { createAppStore } from './app.svelte';
import { createSessionStore } from './session.svelte';
import { createUIStore } from './ui.svelte';
import { createMatrixStore } from './matrix.svelte';
import { createDBStore } from './db.svelte';
import { createSettingsStore } from './settings.svelte';

export function createStore() {

	return {

		get app() {
			return createAppStore();
		},

		get session() {
			return createSessionStore();
		},

		get ui() {
			return createUIStore();
		},

        get db() {
            return createDBStore();
        },

		get matrix() {
			return createMatrixStore();
		},

		get settings() {
			return createSettingsStore();
		},

	};
}
