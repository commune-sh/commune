import { PUBLIC_MATRIX_URL } from '$env/static/public';
import { redirect } from "@sveltejs/kit";
import { error } from '@sveltejs/kit';


/** @type {import('./$types').LayoutServerLoad} */
export async function load( { fetch, params, url, cookies, request } ) {

  let data = {
    authenticated: false,
    homeserver_reachable: false,
  };

  const access_token = cookies.get('access_token');

  if( access_token ) {

    try {

      let url = `${PUBLIC_MATRIX_URL}/_matrix/client/v3/account/whoami`;
      const res = await fetch( url );
      const resp = await res.json();
      if(resp?.user_id && resp?.device_id) {
        data.authenticated = true;
        data.access_token = access_token;
        data.user_id = resp.user_id;
        data.device_id = resp.device_id;
      }
      data.homeserver_reachable = true;
    } catch (_) {
    }
  }

  return data;
}
