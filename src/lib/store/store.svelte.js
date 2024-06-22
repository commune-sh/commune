import { createClientStore } from './client.svelte.js';
import { createUIStore } from './ui.svelte.js';
import { createAuthStore } from './auth.svelte.js';
import { createMatrixStore } from './matrix.svelte.js';
import { createSettingsStore } from './settings.svelte.js';

export function createStore() {

	return {



		get client() {
			return createClientStore();
		},

		get ui() {
			return createUIStore();
		},

		get auth() {
			return createAuthStore();
		},

		get matrix() {
			return createMatrixStore();
		},

		get settings() {
			return createSettingsStore();
		},

	};
}
