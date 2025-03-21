import { createAppStore } from './app.svelte';
import { createUIStore } from './ui.svelte';
import { createAuthStore } from './auth.svelte';
import { createMatrixStore } from './matrix.svelte';
import { createSettingsStore } from './settings.svelte';

export function createStore() {

	return {

		get app() {
			return createAppStore();
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
