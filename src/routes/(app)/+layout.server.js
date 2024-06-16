import { PUBLIC_SERVER, PUBLIC_MATRIX_URL } from '$env/static/public';
import { redirect } from "@sveltejs/kit";
import { error } from '@sveltejs/kit';


/** @type {import('./$types').LayoutServerLoad} */
export async function load( { fetch, params, url, cookies, request } ) {

  let data = {
    public_server_exists: false,
    public_server_reachable: false,
    capabilities: null,
    homeserver_reachable: false,
    homeserver_versions: null,
  };

  // fetch public server capabilities

  if(PUBLIC_SERVER != "") {

    try {

      let url = `${PUBLIC_SERVER}/capabilities`;
      const res = await fetch( url );
      const resp = await res.json();
      if(resp?.capabilities) {
        data.public_server_exists = true;
        data.public_server_reachable = true;
        data.capabilities = resp?.capabilities;
      }

    } catch (error) {

    }

  }

  if(PUBLIC_MATRIX_URL != "") {

    try {

      let url = `${PUBLIC_MATRIX_URL}/_matrix/client/versions`;
      const res = await fetch( url );
      const resp = await res.json();
      if(resp) {
        data.homeserver_reachable = true;
        data.homeserver_versions = resp;
      }

    } catch (err) {
      error(503, {
        code: 503,
        message: 'Matrix homeserver not reachable',
      });
    }

  }

  return data;
}
