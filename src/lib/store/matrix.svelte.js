import { PUBLIC_MATRIX_URL } from '$env/static/public';
import * as sdk from 'matrix-js-sdk';

let client = $state(null)

let synced = $state(false)

export function createMatrixStore() {

  async function setup(credentials) {
    console.log("Setting up Matrix client for:", credentials.user_id)
    window.client = sdk.createClient({
      baseUrl: PUBLIC_MATRIX_URL,
      accessToken: credentials.access_token,
      userId: credentials.user_id,
    });
    await window.client.startClient();


  }

	return {
		get client() {
			return client;
		},
		get store() {
			return store;
		},
		get synced() {
			return synced;
		},
    setup,
	};

}
