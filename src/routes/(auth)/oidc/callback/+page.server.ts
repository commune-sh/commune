import { redirect } from "@sveltejs/kit";
import { PUBLIC_HOMESERVER, PUBLIC_APP_NAME } from '$env/static/public';

import { login } from '$lib/matrix/requests'

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ url, fetch, cookies }) => {

    /*
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
    */

    let loginToken = url.searchParams.get('loginToken')

    try {
        let resp = await login({
            initial_device_display_name: PUBLIC_APP_NAME,
            token: loginToken,
            type: "m.login.token",
        })

        if(resp?.access_token && resp?.user_id && resp?.device_id) {
            console.log(resp)

            const res = await fetch('/api/auth/session', {
                method: 'POST',
                body: JSON.stringify({
                    access_token: resp.access_token,
                    device_id: resp.device_id,
                    user_id: resp.user_id,
                }),
            });

            const json = await res.json();

            console.log("resp", json)

            /*
            store.auth.saveSession({
                access_token: resp.access_token,
                user_id: resp.user_id,
                device_id: resp.device_id,
                home_server: resp.home_server,
            })
            */
        }

    } catch (error: any) {
        console.log(error)
    }
    redirect(302, '/')
};
