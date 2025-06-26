import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';
import {
    PUBLIC_BASE_URL,
    PUBLIC_APPSERVICE_URL,
    PUBLIC_HOMESERVER_URL,
    PUBLIC_HOMESERVER_NAME
} from '$env/static/public';

import { 
    download_media
} from '$lib/appservice/requests.svelte'

import { matrixWellKnown, appserviceHealth } from '$lib/commune/types'

import type { Data } from '$lib/commune/types'

import { authenticate, type AuthCookies } from '$lib/server/auth';

export async function initializeAppData(
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
                oidc_client_id,
                access_token,
                refresh_token,
                expires_in,
                scope,
            } as AuthCookies);
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
        BASE_URL: PUBLIC_BASE_URL,
        APPSERVICE_URL: PUBLIC_APPSERVICE_URL,
        HOMESERVER_URL: PUBLIC_HOMESERVER_URL,
        HOMESERVER_NAME: PUBLIC_HOMESERVER_NAME,
        READ_ONLY: env?.PUBLIC_READ_ONLY === 'true',
        authenticated: authenticated,
        oidc_client_id: oidc_client_id || null,
        metadata: {
            space: {},
            room: {},
            event: {},
            sender: {},
            image: null
        }
    };

    if (authenticated) {
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
    let appservice_endpoint = `${data.APPSERVICE_URL}/health`;

    try {
        const appservice_response = await fetch(appservice_endpoint);
        const resp = await appservice_response.json();

        let validated = appserviceHealth.safeParse(resp);

        if (validated.success) {
            data.APPSERVICE_IDENTITY = validated.data.user_id;
        } else {
            console.error("Appservice health validation failed:", validated.error);
            error(500, {
                message: "Invalid appservice health response."
            });
        }

    } catch (err) {
        error(500, {
            message: "Failed to connect to appservice."
        });
    }

    let endpoint = `https://${PUBLIC_HOMESERVER_NAME}/.well-known/matrix/client`;
    try {
        const response = await fetch(endpoint);
        const resp = await response.json();

        const validation = matrixWellKnown.safeParse(resp);

        if(validation.success && !access_token && !client_id && params.space != undefined) {

            let iurl = `${data.APPSERVICE_URL}/_matrix/client/v3/rooms/${params.space}/info`
            console.log(iurl)
            if(params.room != undefined) {
                iurl = `${data.APPSERVICE_URL}/_matrix/client/v3/rooms/${params.space}/info?room=${params.room}`
                let event = url.searchParams.get('event');
                if(event) {
                    iurl = `${data.APPSERVICE_URL}/_matrix/client/v3/rooms/${params.space}/info?room=${params.room}&event=${event}`
                }
            }

            const r = await fetch(iurl)
            const info = await r.json()
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

            console.log("Metadata gathered:", data.metadata);

            if(data?.metadata?.image) {
                console.log("Downloading image from:", data.metadata.image)
                let content_uri = await download_media(data?.metadata?.image, data.APPSERVICE_URL)
                if(content_uri) {
                    console.log("Image downloaded to:", content_uri)
                    data.metadata.image = content_uri;
                }
            } 

        }

    } catch (err) {
        error(500, {
            message: "Failed to fetch well-known configuration."
        });
    }

    return data;
}
