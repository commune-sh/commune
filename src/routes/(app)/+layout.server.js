import { PUBLIC_MATRIX_URL } from '$env/static/public';
import { redirect } from "@sveltejs/kit";
import { error } from '@sveltejs/kit';


/** @type {import('./$types').LayoutServerLoad} */
export async function load( { fetch, params, url, cookies, request } ) {

  let data = {
    authenticated: false,
    server_status: 'unknown',
  };

  const access_token = cookies.get('access_token');

  if( access_token ) {

    try {

      let url = `${PUBLIC_MATRIX_URL}/_matrix/client/v3/account/whoami`;
      const res = await fetch( url );
      const resp = await res.json();
      if(resp?.user_id && resp?.device_id) {
        data.authenticated = true;
        data.user_id = resp.user_id;
        data.device_id = resp.device_id;
      } else if(resp?.errcode == "M_UNKNOWN_TOKEN") {
        data.server_status = 'alive';
      }
    } catch (_) {
    }
  }

  return data;
}
