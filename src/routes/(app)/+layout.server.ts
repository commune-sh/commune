import { parse } from 'tldts';

import { env } from '$env/dynamic/public';

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
        access_token_exists: false,
        native_mode: false,
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


    let BASE_URL = env.PUBLIC_BASE_URL;

    if(BASE_URL) {
        data.BASE_URL = BASE_URL;
    } else {
        let base_url = `https://${url.hostname}`
        data.BASE_URL = base_url;
    }


    let domain = parse(url.origin).domain;

    let HOMESERVER_NAME = env.PUBLIC_HOMESERVER_NAME;

    if(HOMESERVER_NAME && HOMESERVER_NAME != "" ) {
        domain = HOMESERVER_NAME;
    }
    const endpoint = `https://${domain}/.well-known/matrix/client`;

    try {
        const response = await fetch(endpoint);
        const resp = await response.json();

        const validation = matrixWellKnown.safeParse(resp);

        if(validation.success) {
            data.HOMESERVER_URL = validation.data["m.homeserver"].base_url;
            data.APPSERVICE_URL = validation.data["commune.appservice"].url;
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
            if(info?.info) {
                data.space = info.info
                if(data?.space?.avatar_url) {
                    data.image = data.space.avatar_url
                }
            }
            if(info?.room) {
                data.room = info.room
                if(data?.room?.avatar_url) {
                    data.image = data.room.avatar_url
                }
            }
            if(info?.event) {
                data.event = info.event
                if(data?.event?.content?.url) {
                    data.image = data.event.content.url
                }
            }
            if(info?.sender) {
                data.sender = info.sender
                if(data?.sender?.avatar_url) {
                    data.image = data.sender.avatar_url
                }
            }

        }

    } catch (_) {
    }

    return data;
};

