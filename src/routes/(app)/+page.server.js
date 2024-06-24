import { redirect } from "@sveltejs/kit";

/** @type {import('./$types').LayoutServerLoad} */
export async function load( { cookies } ) {
  const access_token = cookies.get('mx_access_token');
  if(!access_token) {
    redirect(302, '/login');
  }
}
