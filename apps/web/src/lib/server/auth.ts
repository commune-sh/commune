import { z } from 'zod';

import type { ENV } from '../types/common'

import { exchangeForToken, whoami, refreshToken } from '../matrix/requests';

export type AuthData = {
    ENV: ENV;
    oidc_client_id: string;
    access_token: string;
    refresh_token: string;
    expires_in: number;
    scope: string;
}

export type SessionData = {
    auth_metadata: any;
    oidc_client_id: string;
    oidc_code_verifier: string;
    state: string;
    code: string;
}

export type UserData = {
    user_id: string;
    is_guest: boolean;
    device_id: string;
}

const WhoAmISchema = z.object({
    user_id: z.string(),
    is_guest: z.boolean(),
    device_id: z.string()
});

type WhoAmI = z.infer<typeof WhoAmISchema>;

export async function authenticate(data: AuthData): Promise<WhoAmI> {
    console.log("authenticating...")

    let auth_metadata;

    let endpoint = `${data.ENV.HOMESERVER_URL}/_matrix/client/unstable/org.matrix.msc2965/auth_metadata`

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
        let user = await whoami(data.ENV.HOMESERVER_URL, data.access_token);
        console.log(user)

        let validated = WhoAmISchema.safeParse(user);
        if(!validated.success) {
            console.error("Invalid user data:", validated.error);
            throw new Error("Invalid user data.");
        }

        return validated.data;

    } catch (error) {
        console.error("Failed to fetch user", error);
        throw new Error("Failed to fetch user.");
    }

}

export async function getAccessToken(
    data: SessionData,
    ENV: ENV
) {

    console.log("Fetching access token.")

    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', data.code);
    params.append('redirect_uri', `${ENV.BASE_URL}/oidc/callback`);
    params.append('client_id', data.oidc_client_id);
    params.append('code_verifier', data.oidc_code_verifier);

    try {
        let resp = await exchangeForToken(data.auth_metadata.token_endpoint, params)
        console.log(resp)
        if(resp?.access_token && resp?.refresh_token) {

            let user = await whoami(ENV.HOMESERVER_URL, resp.access_token) 

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


