import { 
  PUBLIC_APPSERVICE, 
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

  return data;
}
