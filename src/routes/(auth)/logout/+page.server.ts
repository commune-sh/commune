import { PUBLIC_BASE_URL } from '$env/static/public';

import type { PageServerLoad } from './$types';
import { redirect } from "@sveltejs/kit";
import { getAuthMetadata, revokeToken } from '$lib/matrix/requests'

export const load: PageServerLoad = async ({ cookies, parent }) => {

    let client_id = cookies.get('oidc_client_id');
    let access_token = cookies.get('access_token');
    let refresh_token = cookies.get('refresh_token');

    cookies.delete('access_token', { path: '/' });
    cookies.delete('refresh_token', { path: '/' });
    cookies.delete('user_id', { path: '/' });
    cookies.delete('expires_in', { path: '/' });
    cookies.delete('device_id', { path: '/' });
    cookies.delete('oidc_code_verifier', { path: '/' });

    let metadata = await fetchAuthMetadata()
    console.log("Fetched metadata:", metadata)

    if(metadata?.revocation_endpoint && client_id && access_token) {
        revoke(metadata.revocation_endpoint, client_id, access_token)
    }

    redirect(302, `/`);

};

async function revoke(endpoint: string, client_id: string, access_token: string) {
    console.log("Attempting to revoke token...", endpoint, client_id, access_token)

    const params = new URLSearchParams();
    params.append('token', access_token);
    params.append('token_type_hint', 'access_token');
    params.append('client_id', client_id);

    try {
        const response = await revokeToken(endpoint, params)
        if(response) {
            console.log("Token revoked.", response)
        }
    } catch (error) {
        console.error(error)
    }
}


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

