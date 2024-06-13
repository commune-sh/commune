import { PUBLIC_MATRIX_URL } from '$env/static/public';
import * as sdk from 'matrix-js-sdk';

let client = $state(null)

export function createMatrixClient() {

	function init(access_token, user_id) {
    client = sdk.createClient({
      baseUrl: PUBLIC_MATRIX_URL,
      accessToken: access_token,
      userId: user_id,
    });
    client.startClient();
  }

	return {
		get client() {
			return client;
		},
		init
	};
}

let access_token_valid = $state(false);
let access_token_validated = $state(false);

export function matrixStore() {

  function validateAccessToken() {
    access_token_validated = true;
  }

	return {
		get access_token_valid() {
			return access_token_valid;
		},
		get access_token_validated() {
			return access_token_validated;
		},
    validateAccessToken,
	};
}
