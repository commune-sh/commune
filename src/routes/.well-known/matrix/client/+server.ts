import { PUBLIC_HOMESERVER_BASE_URL, PUBLIC_APPSERVICE } from '$env/static/public';
import { json } from '@sveltejs/kit';

export function GET() {
  const data = {
    'm.homeserver': {
      'base_url': PUBLIC_HOMESERVER_BASE_URL,
    },
    "commune.appservice": {
      "url": PUBLIC_APPSERVICE
    },
  }

  return json(data);
}

