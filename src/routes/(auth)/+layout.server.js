import { redirect } from "@sveltejs/kit";

/** @type {import('./$types').LayoutServerLoad} */
export async function load( { fetch, params, url, cookies, request } ) {
  const access_token = cookies.get('mx_access_token');
  if(access_token) {
    redirect(302, '/');
  }
}
