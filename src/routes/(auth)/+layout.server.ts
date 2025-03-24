import { 
    PUBLIC_HOMESERVER_BASE_URL
} from '$env/static/public';
import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, url, fetch }) => {

    const access_token = cookies.get('mx_access_token');
    if(access_token) {
        redirect(302, '/');
    }

};
