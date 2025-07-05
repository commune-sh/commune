import { PUBLIC_HOMESERVER_URL, PUBLIC_APPSERVICE_URL } from '$env/static/public';
import { json } from '@sveltejs/kit';

export function GET() {
  const data = {
    'm.homeserver': {
      'base_url': PUBLIC_HOMESERVER_URL
    },
    "commune.appservice": {
      "url": PUBLIC_APPSERVICE_URL
    },
  }

  return json(data);
}

