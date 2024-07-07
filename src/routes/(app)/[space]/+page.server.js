import { 
  PUBLIC_HOMESERVER_BASE_URL, 
} from '$env/static/public';

import { naiveRoomIDCheck } from '$lib/utils/matrix'

import { redirect } from "@sveltejs/kit";

/** @type {import('./$types').LayoutServerLoad} */
export async function load( { fetch, params, url, cookies, request } ) {

  const access_token = cookies.get('mx_access_token');

  let data = {
  };

  if(!access_token) {

    let url = `${PUBLIC_HOMESERVER_BASE_URL}/.well-known/matrix/client`
    const response = await fetch(url)
    const resp =  await response.json()
    if(resp?.["commune.appservice"]?.url) {

      const u = resp["commune.appservice"].url

      let url = `${u}/_matrix/client/v3/rooms/${params.space}/state`
      const r = await fetch(url)
      const x =  await r.json()
      console.log(x)
    }
  }

  return data;
}

