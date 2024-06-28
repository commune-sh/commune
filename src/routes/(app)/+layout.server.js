import { 
  PUBLIC_SERVER, 
} from '$env/static/public';

import { redirect } from "@sveltejs/kit";

/** @type {import('./$types').LayoutServerLoad} */
export async function load( { fetch, params, url, cookies, request } ) {

  const access_token = cookies.get('mx_access_token');

  let data = {
    access_token_exists: !!access_token,
    native_mode: false,
  };

  if(PUBLIC_SERVER == "") {
    data.native_mode = true;
  }

  if(!access_token && PUBLIC_SERVER == '') {
    redirect(302, '/login');
  }

  return data;
}
