import { PUBLIC_HOMESERVER } from '$env/static/public';

/** @type {import('@sveltejs/kit').HandleFetch} */
export async function handleFetch({ request, fetch, event: { cookies } }) {
  if (request.url.startsWith(PUBLIC_HOMESERVER)) {
    request.headers.set('Authorization', `Bearer ${cookies.get('mx_access_token')}`);
  }
  return fetch(request);
}

