import { PUBLIC_HOMESERVER } from '$env/static/public';
import { v4 as uuidv4 } from 'uuid';

/** @type {import('@sveltejs/kit').Handle} */
export const handle = async ({ event, resolve }) => {

  // check if request is from bot or search engine
  const userAgent = event.request.headers.get("user-agent");

  const browsers = [
    /Chrome\/\d+/i,
    /Firefox\/\d+/i,
    /Safari\/\d+/i,
    /Edg\/\d+/i,    
    /Opera\/\d+/i,   
    /OPR\/\d+/i       
  ];

  const isBrowser = browsers.some(pattern => pattern.test(userAgent));

  let client_id = event.cookies.get("client_id");

  if(!client_id && isBrowser) {
    let id = uuidv4();
    event.cookies.set("client_id", id, {
      maxAge: 60 * 60 * 24 * 365, 
      path: '/',
    })
  }

  const response = await resolve(event);

  return response;
};

/** @type {import('@sveltejs/kit').HandleFetch} */
export async function handleFetch({ request, fetch, event: { cookies } }) {
  if (request.url.startsWith(PUBLIC_HOMESERVER)) {
    request.headers.set('Authorization', `Bearer ${cookies.get('mx_access_token')}`);
  }
  return fetch(request);
}

