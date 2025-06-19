import { parse } from 'tldts';

import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';

import {
    PUBLIC_BASE_URL,
    PUBLIC_APPSERVICE_URL,
    PUBLIC_HOMESERVER_URL,
    PUBLIC_HOMESERVER_NAME
} from '$env/static/public';

//import { redirect } from "@sveltejs/kit";
import type { Data } from '$lib/commune/types'

import { matrixWellKnown, type MatrixWellKnown } from '$lib/commune/types'

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ fetch, params, url, cookies } ) => {

    const access_token = cookies.get('access_token');
    const refresh_token = cookies.get('refresh_token');
    const expires_in = cookies.get('expires_in');
    const user_id = cookies.get('user_id');
    const device_id = cookies.get('device_id');
    const scope = cookies.get('scope');

    const client_id = cookies.get('client_id');
    const oidc_client_id = cookies.get('oidc_client_id');

    let data: Data = {
        BASE_URL: PUBLIC_BASE_URL,
        APPSERVICE_URL: PUBLIC_APPSERVICE_URL,
        HOMESERVER_URL: PUBLIC_HOMESERVER_URL,
        HOMESERVER_NAME: PUBLIC_HOMESERVER_NAME,
        access_token_exists: false,
        native_mode: false,
        metadata: {
            space: {},
            room: {},
            event: {},
            sender: {},
            image: null
        }
    };

    if(access_token && user_id && device_id) {
        data.session = {
            access_token,
            user_id,
            device_id,
        }
    }

    if(refresh_token && expires_in && data?.session) {
        data.session.refresh_token = refresh_token
        data.session.expires_in = parseInt(expires_in)
    }

    if(data?.session && scope) {
        data.session.scope = scope
    }

    if(oidc_client_id) {
        data.oidc_client_id = oidc_client_id
    }

    // query public appservice health
    let appservice_endpoint = `${data.APPSERVICE_URL}/health`;

    try {
        const appservice_response = await fetch(appservice_endpoint);
        const resp = await appservice_response.json();
    } catch (err) {
        error(500, {
            message: "Failed to connect to appservice."
        });
    }


    let endpoint = `https://${PUBLIC_HOMESERVER_NAME}/.well-known/matrix/client`;

    console.log("Well-known endpoint is:", endpoint)

    try {
        const response = await fetch(endpoint);
        const resp = await response.json();

        const validation = matrixWellKnown.safeParse(resp);

        if(validation.success) {
            let APPSERVICE_URL = validation.data["commune.appservice"].url;
        }

        if(validation.success && !access_token && client_id && params.space != undefined) {

            let iurl = `${data.APPSERVICE_URL}/_matrix/client/v3/rooms/${params.space}/info`
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

        }

    } catch (err) {
        error(500, {
            message: "Failed to fetch well-known configuration."
        });
    }

    return data;
};

