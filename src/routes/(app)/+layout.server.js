import { 
  PUBLIC_SERVER, 
  PUBLIC_MATRIX_URL, 
  PUBLIC_REQUIRE_AUTH 
} from '$env/static/public';

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
  } else {
      let url = `${PUBLIC_MATRIX_URL}/_matrix/client/versions`;
      const res = await fetch( url );
      const resp = await res.json();
      if(resp?.versions) {
        data.homeserver_reachable = true;
      }
  }


  if(params?.space != "" && PUBLIC_SERVER != "") {
    try {

      let url = `${PUBLIC_SERVER}/rooms/${params.space}/state`;
      const res = await fetch( url );
      const resp = await res.json();
      if(resp?.room_id) {
        data.space = params.space;
        data.space_state = resp;
      }
    } catch (_) {
    }
  }


  if(!access_token && PUBLIC_REQUIRE_AUTH == 'true') {
    throw redirect(302, '/login');
  }

  return data;
}
