import { 
    PUBLIC_BASE_URL
} from '$env/static/public';
import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from './$types';

import { getAuthMetadata, registerOauthClient } from '$lib/matrix/requests'

export const load: LayoutServerLoad = async ({ cookies, url, fetch }) => {

    return

    let oidc_client_id = cookies.get('oidc_client_id');

    let metadata = await fetchAuthMetadata()

    if(!oidc_client_id && metadata?.registration_endpoint && metadata?.authorization_endpoint) {

        let client_id = await newClient(metadata.registration_endpoint, metadata.authorization_endpoint)
        console.log("New client registered:", client_id)

        oidc_client_id = client_id

        cookies.set('oidc_client_id', client_id, {
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 365,
            secure: true,
            sameSite: 'lax',
            path: '/'
        });

    }

    const access_token = cookies.get('mx_access_token');
    if(access_token) {
        redirect(302, '/');
    }

    return {
        metadata,
        oidc_client_id
    }
};


async function fetchAuthMetadata() {
    try {
        const response = await getAuthMetadata()
        console.log("OIDC metadata fetched.")
        if(response) {
            return response
        }
    } catch (error) {
        console.error(error)
    }
}

async function newClient(
    registration_endpoint: string, 
    authorization_endpoint: string
) {
    try {
        const response = await registerOauthClient(registration_endpoint)
        console.log("Client registered?:", response)
        console.log(registration_endpoint, authorization_endpoint)

        if(response?.client_id) {
            return response.client_id
        }

    } catch (error) {
        console.error(error)
    }
}


