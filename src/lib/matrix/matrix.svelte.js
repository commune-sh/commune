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
