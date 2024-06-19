import { PUBLIC_MATRIX_URL } from '$env/static/public';

/** @type {import('@sveltejs/kit').HandleFetch} */
export async function handleFetch({ request, fetch, event: { cookies } }) {
  if (request.url.startsWith(PUBLIC_MATRIX_URL)) {
    request.headers.set('Authorization', `Bearer ${cookies.get('access_token')}`);
  }
 
  return fetch(request);
}

