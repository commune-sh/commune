import { redirect } from "@sveltejs/kit";

/** @type {import('./$types').LayoutServerLoad} */
export async function load( { fetch, params, url, cookies, request } ) {

  let loginToken = url.searchParams.get('loginToken')
  if(!loginToken) {
    redirect(302, '/login');
  }
}

