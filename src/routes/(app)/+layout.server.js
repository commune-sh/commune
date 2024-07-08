import { 
  PUBLIC_APPSERVICE, 
  PUBLIC_HOMESERVER_BASE_URL
} from '$env/static/public';

import { redirect } from "@sveltejs/kit";

/** @type {import('./$types').LayoutServerLoad} */
export async function load( { fetch, params, url, cookies, request } ) {

  const access_token = cookies.get('mx_access_token');

  let data = {
    access_token_exists: !!access_token,
    native_mode: false,
  };

  if(!access_token && PUBLIC_APPSERVICE == '') {
    redirect(302, '/login');
  }

  if(!access_token && params.space != undefined ) {

    try {
      let url = `${PUBLIC_HOMESERVER_BASE_URL}/.well-known/matrix/client`
      const response = await fetch(url)
      const resp =  await response.json()
      if(resp?.["commune.appservice"]?.url) {

        const u = resp["commune.appservice"].url

        let url = `${u}/_matrix/client/v3/rooms/${params.space}/info`
        const r = await fetch(url)
        const space =  await r.json()
        data.space = space
      }
    } catch(_) {
    }

  }

  return data;
}
