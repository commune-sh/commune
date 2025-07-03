import { redirect } from "@sveltejs/kit";

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ url, fetch, cookies, parent }) => {

    let data = await parent();

    let oidc_client_id = cookies.get('oidc_client_id');
    let oidc_code_verifier = cookies.get('oidc_code_verifier');

    let redirect_to = cookies.get('redirect_to');

    cookies.delete('oidc_code_verifier', { path: '/' });
    cookies.delete('redirect_to', { path: '/' });

    let auth_metadata;

    let endpoint = `${data.PUBLIC_HOMESERVER_URL}/_matrix/client/unstable/org.matrix.msc2965/auth_metadata`

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
        data,
        auth_metadata,
        oidc_client_id,
        oidc_code_verifier,
        loginToken,
        state,
        code,
        redirect_to
    };
};
