import { PUBLIC_BASE_URL, PUBLIC_HOMESERVER_URL } from '$env/static/public';
import { exchangeForToken, whoami, refreshToken } from '$lib/matrix/requests';

export type AuthCookies = {
    oidc_client_id: string;
    access_token: string;
    refresh_token: string;
    expires_in: number;
    scope: string;
    user_id: string;
    device_id: string;
}

export type AuthData = {
    auth_metadata: any;
    oidc_client_id: string;
    oidc_code_verifier: string;
    state: string;
    code: string;
}

export async function authenticate(data: AuthCookies): Promise<boolean> {
    console.log("authenticating...")

    let auth_metadata;

    let endpoint = `${PUBLIC_HOMESERVER_URL}/_matrix/client/unstable/org.matrix.msc2965/auth_metadata`

    try {
        const response = await fetch(endpoint)
        const resp = await response.json();
        if(resp) {
            auth_metadata = resp
        }
    } catch (error) {
        console.error(error)
    }

    try {
        let user = await whoami(data.access_token);
        if(user?.errcode == "M_UNKNOWN_TOKEN") {
            console.error("Invalid access token.")
            throw new Error("Invalid access token.");
        }
        if(user?.user_id !== data.user_id) {
            console.error("User ID mismatch", user, data);
            throw new Error("User ID mismatch.");
        }
        if(user?.device_id !== data.device_id) {
            console.error("Device ID mismatch", user, data);
            throw new Error("Device ID mismatch.");
        }
    } catch (error) {
        console.error("Failed to fetch user", error);
        throw new Error("Failed to fetch user.");
    }

    return true;
}

export async function getAccessToken(
    data: AuthData
) {

    console.log("Fetching access token.")

    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', data.code);
    params.append('redirect_uri', `${PUBLIC_BASE_URL}/oidc/callback`);
    params.append('client_id', data.oidc_client_id);
    params.append('code_verifier', data.oidc_code_verifier);

    try {
        let resp = await exchangeForToken(data.auth_metadata.token_endpoint, params)
        console.log(resp)
        if(resp?.access_token && resp?.refresh_token) {

            let user = await whoami(resp.access_token) 

            let expires_in = Date.now() + (resp.expires_in * 1000)

            const res = await fetch('/api/auth/token', {
                method: 'POST',
                body: JSON.stringify({
                    access_token: resp.access_token,
                    refresh_token: resp.refresh_token,
                    expires_in: expires_in,
                    user_id: user.user_id,
                    device_id: user.device_id,
                }),
            });

            const json = await res.json();
            console.log("Tokens stored?", json)
            console.log("done logging in")
        }
    } catch (error) {
    }

}


