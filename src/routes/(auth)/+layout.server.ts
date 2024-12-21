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

    let curl = `${PUBLIC_HOMESERVER_BASE_URL}/.well-known/matrix/client`
    const response = await fetch(curl)
    const resp =  await response.json()


    let pathname = url.pathname;

    let paths = ["login", "signup", "register"]

    if(paths.includes(pathname)) {

        if(resp?.["org.matrix.msc2965.authentication"]?.issuer) {
            let issuer = resp["org.matrix.msc2965.authentication"].issuer
            let login_url = `${issuer}login`
        }

    }


};
