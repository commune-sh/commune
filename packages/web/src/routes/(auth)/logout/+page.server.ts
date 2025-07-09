import type { PageServerLoad } from './$types';
import { redirect } from "@sveltejs/kit";
import { logout, revokeToken } from '$ui/matrix/requests'

export const load: PageServerLoad = async ({ cookies, parent }) => {

    let access_token = cookies.get('access_token');
    let refresh_token = cookies.get('refresh_token');

    cookies.delete('access_token', { path: '/' });
    cookies.delete('refresh_token', { path: '/' });
    cookies.delete('user_id', { path: '/' });
    cookies.delete('expires_in', { path: '/' });
    cookies.delete('device_id', { path: '/' });
    cookies.delete('oidc_code_verifier', { path: '/' });
    cookies.delete('scope', { path: '/' });

    const data = await parent();

    if(access_token && !refresh_token) {
        console.log("Compat mode, logout using access token.")
        await logout(data.PUBLIC_HOMESERVER_URL, access_token);
        redirect(302, `/`);
    }

    if(data.metadata?.revocation_endpoint && data.oidc_client_id && access_token) {
        revoke(data.metadata.revocation_endpoint, data.oidc_client_id, access_token)
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
        if(response.status === 200) {
            console.log("Token revoked.")
        }
    } catch (error) {
        console.error(error)
    }
}
