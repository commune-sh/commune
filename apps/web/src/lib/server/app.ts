import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';

import { download_media } from '../appservice/requests.svelte'
import { getAuthMetadata } from '../matrix/requests';

import { matrixWellKnown, appserviceHealth } from '../types/common'

import type { ENV, Data } from '../types/common'

import { authenticate, type AuthData } from '../server/auth';

export async function initializeAppData(
    ENV: ENV,
    cookies: any, 
    params: any,
    url: any
): Promise<Data> {

    const access_token = cookies.get('access_token');
    const refresh_token = cookies.get('refresh_token');
    const expires_in = cookies.get('expires_in');
    let user_id;
    let device_id;
    const scope = cookies.get('scope');

    const client_id = cookies.get('client_id');
    const oidc_client_id = cookies.get('oidc_client_id');

    let auth_cookies = oidc_client_id && access_token && refresh_token && expires_in && scope;

    let authenticated = false;

    if(auth_cookies) {
        try {
            let resp = await authenticate({
                ENV,
                oidc_client_id,
                access_token,
                refresh_token,
                expires_in,
                scope,
            } as AuthData);
            console.log("Authentication successful?:", resp);
            authenticated = true

            user_id = resp.user_id;
            device_id = resp.device_id;

        } catch (err) {
            console.error("Authentication failed:", err);
            console.error("Deleting cookies.")
            cookies.delete('access_token', { path: '/' });
            cookies.delete('refresh_token', { path: '/' });
            cookies.delete('user_id', { path: '/' });
            cookies.delete('expires_in', { path: '/' });
            cookies.delete('device_id', { path: '/' });
            cookies.delete('scope', { path: '/' });
            cookies.delete('oidc_code_verifier', { path: '/' });
        }
    }


    let data: Data = {
        ENV: ENV,
        APPSERVICE_IDENTITY: undefined,
        supports_OIDC: false,
        READ_ONLY: env?.PUBLIC_READ_ONLY === 'true',
        authenticated: authenticated,
        oidc_client_id: oidc_client_id || null,
        metadata: {
            space: null,
            room: null,
            event: null,
            sender: null,
            image: null, 
        },
    };


    // get oidc configuration
    try {
        let auth_metadata = await getAuthMetadata(ENV.HOMESERVER_URL);
        if(auth_metadata) {
            data.auth_metadata = auth_metadata;
            data.supports_OIDC = true;
        }
    } catch (err) {
        console.error("Failed to fetch auth metadata:", err);
    }


    if (authenticated && user_id && device_id) {
        data.session = {
            access_token: access_token,
            user_id: user_id,
            device_id: device_id,
            refresh_token: refresh_token,
            expires_in: parseInt(expires_in),
            scope: scope,
        }
    }

    if(oidc_client_id) {
        data.oidc_client_id = oidc_client_id
    }

    // query public appservice health
    let appservice_endpoint = `${ENV.APPSERVICE_URL}/health`;

    try {
        const appservice_response = await fetch(appservice_endpoint);
        if (!appservice_response.ok) {
            console.error("Appservice health check failed with status:", appservice_response.status);
            throw new Error("Failed to fetch appservice health.");
        }

        const resp = await appservice_response.json();
        if (!resp) {
            console.error("Appservice health response is empty.");
            throw new Error("Empty appservice health response.");
        }

        let validated = appserviceHealth.safeParse(resp);

        if (validated.success) {
            if ('error' in validated.data) {
                console.error("Appservice health check failed:", validated.data.error);
                throw new Error(validated.data.error);

            } else {
                data.APPSERVICE_IDENTITY = validated.data.user_id;
                data.features = validated.data.features;
            }
        } else {
            console.error("Appservice health validation failed:", validated.error);
            error(500, {
                message: "Invalid appservice health response."
            });
        }

    } catch (err: any) {
        error(500, {
            message: err.message,
        });
    }

    let endpoint = `https://${ENV.HOMESERVER_NAME}/.well-known/matrix/client`;
    try {
        const response = await fetch(endpoint);
        const resp = await response.json();

        const validation = matrixWellKnown.safeParse(resp);

        if(validation.success && !access_token && !client_id && params.space != undefined) {

            let iurl = `${ENV.APPSERVICE_URL}/_matrix/client/v3/rooms/${params.space}/info`
            console.log(iurl)
            if(params.room != undefined) {
                iurl = `${ENV.APPSERVICE_URL}/_matrix/client/v3/rooms/${params.space}/info?room=${params.room}`
                let event = url.searchParams.get('event');
                if(event) {
                    iurl = `${ENV.APPSERVICE_URL}/_matrix/client/v3/rooms/${params.space}/info?room=${params.room}&event=${event}`
                }
            }

            const r = await fetch(iurl)
            const info = await r.json()
            console.log("uil", info)
            if(info?.info && data?.metadata) {
                data.metadata.space = info.info
                if(data.metadata?.space?.avatar_url) {
                    data.metadata.image = data.metadata.space.avatar_url
                }
            }
            if(info?.room && data?.metadata) {
                data.metadata.room = info.room
                if(data.metadata?.room?.avatar_url) {
                    data.metadata.image = data.metadata.room.avatar_url
                }
            }
            if(info?.event && data?.metadata) {
                data.metadata.event = info.event
                if(data.metadata?.event?.content?.url) {
                    data.metadata.image = data.metadata.event.content.url
                }
            }
            if(info?.sender && data?.metadata) {
                data.metadata.sender = info.sender
                if(data.metadata?.sender?.avatar_url) {
                    data.metadata.image = data.metadata.sender.avatar_url
                }
            }


            if(data?.metadata?.image) {
                console.log("Downloading image from:", data.metadata.image)
                let content_uri = await download_media(ENV.APPSERVICE_URL, data?.metadata?.image)
                if(content_uri) {
                    console.log("Image downloaded to:", content_uri)
                    data.metadata.image = content_uri;
                }
            } 
            console.log("Metadata gathered:", data.metadata);

        }

    } catch (err) {
        error(500, {
            message: "Failed to fetch well-known configuration."
        });
    }

    return data;
}
