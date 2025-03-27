import { redirect } from "@sveltejs/kit";
import { PUBLIC_HOMESERVER } from '$env/static/public';

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ url, fetch, cookies }) => {

    let oidc_client_id = cookies.get('oidc_client_id');
    let oidc_code_verifier = cookies.get('oidc_code_verifier');

    cookies.delete('oidc_code_verifier', { path: '/' });

    let auth_metadata;

    let endpoint = `${PUBLIC_HOMESERVER}/_matrix/client/unstable/org.matrix.msc2965/auth_metadata`

    try {
        const response = await fetch(endpoint)
        const resp = await response.json();
        if(resp) {
            auth_metadata = resp
        }
    } catch (error) {
        console.error(error)
    }


    let loginToken = url.searchParams.get('loginToken')
    let state = url.searchParams.get('state')
    let code = url.searchParams.get('code')

    if(!loginToken && !state && !code) {
        redirect(302, '/login');
    }

    return {
        auth_metadata,
        oidc_client_id,
        oidc_code_verifier,
        loginToken,
        state,
        code
    };
};
