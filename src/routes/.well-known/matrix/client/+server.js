import { PUBLIC_HOMESERVER_BASE_URL } from '$env/static/public';
import { json } from '@sveltejs/kit';

export function GET() {
  const data = {
    'm.homeserver': {
      'base_url': PUBLIC_HOMESERVER_BASE_URL,
    },
    "commune.appservice": {
      "url": "https://public.commune.sh"
    },
    "org.matrix.msc3575.proxy": {
      "url": "https://matrix.commune.sh"
    }
  }

  return json(data);
}

